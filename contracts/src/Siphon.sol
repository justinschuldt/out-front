pragma solidity ^0.6;
pragma experimental ABIEncoderV2;

import "./IERC20.sol";
import "./IEIP1271Validator.sol";
import "./LibSafeMath.sol";

contract Siphon {

    using LibSafeMath for uint256;

    struct SiphonPermission {
        address owner;
        address sender;
        address token;
        address to;
        uint64 expiration;
        uint256 nonce;
        uint256 fee;
    }

    bytes4 constant private EIP1271_VALID = 0x20c13b0b;
    bytes32 constant EIP712_SIPHON_PERSMISSION_DOMAIN_TYPEHASH = keccak256(
        "EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)"
    );
    bytes32 constant EIP712_SIPHON_PERSMISSION_TYPEHASH = keccak256(
        "SiphonPermission(address owner,address sender,address token,address to,uint64 expiration,uint256 nonce,uint256 fee)"
    );

    mapping(bytes32 => uint64) public executed;

    function siphon(SiphonPermission memory perm, bytes memory signature) public {
        require(perm.expiration > now, 'Siphon/EXPIRED');
        require(perm.sender == msg.sender, 'Siphon/INVALID_SENDER');
        bytes32 permHash = keccak256(abi.encode(perm));
        require(executed[permHash] == 0, 'Siphon/ALREADY_EXECUTED');
        require(isValidSignature(perm, signature), 'Siphon/INVALID_SIGNATURE');

        executed[permHash] = uint64(now);
        if (perm.fee > 0) {
            _transferTokens(perm.token, perm.owner, msg.sender, perm.fee);
        }
        uint256 ownerBalance = IERC20(perm.token).balanceOf(perm.owner);
        if (ownerBalance > 0) {
            _transferTokens(
                perm.token,
                perm.owner,
                perm.to,
                ownerBalance
            );
        }
    }

    function isValidSignature(
        SiphonPermission memory perm,
        bytes memory signature
    )
        public view returns (bool isValid)
    {
        if (_isContractAt(perm.owner)) {
            return _isValidEIP1271Signature(perm.owner, abi.encode(perm), signature);
        }
        return _isValidHashSignature(perm.owner, _getEIP712Hash(perm), signature);
    }

    function _isValidHashSignature(address signer, bytes32 hash, bytes memory signature)
        private pure returns (bool isValid)
    {
        if (signature.length != 65) {
            return false;
        }
        bytes32 r;
        bytes32 s;
        uint8 v;
        assembly {
            r := mload(add(signature, 32))
            s := mload(add(signature, 64))
            v := and(mload(add(signature, 65)), 0x00000000000000000000000000000000000000000000000000000000000000ff)
        }
        return ecrecover(hash, v, r, s) == signer;
    }

    function _isValidEIP1271Signature(
        address signer,
        bytes memory data,
        bytes memory signature
    )
        private view returns (bool isValid)
    {
        return IEIP1271Validator(signer).isValidSignature(data, signature)
            == EIP1271_VALID;
    }

    function _getEIP712Hash(SiphonPermission memory perm)
        private view returns (bytes32 eip712Hash)
    {
        uint256 chainId;
        assembly { chainId := chainid() }
        bytes32 domainSeparator = keccak256(abi.encode(
            EIP712_SIPHON_PERSMISSION_DOMAIN_TYPEHASH,
            keccak256(bytes('Siphon')),
            keccak256(bytes('1.0.0')),
            chainId,
            address(this)
        ));
        bytes32 messageHash = keccak256(abi.encode(
            EIP712_SIPHON_PERSMISSION_TYPEHASH,
            perm.owner,
            perm.sender,
            perm.token,
            perm.to,
            perm.expiration,
            perm.nonce,
            perm.fee
        ));
        return keccak256(abi.encodePacked(
            '\x19\x01',
            domainSeparator,
            messageHash
        ));
    }

    function _isContractAt(address at) private view returns (bool isContract) {
        bytes32 codeSize;
        assembly { codeSize := extcodesize(at) }
        isContract = codeSize != 0;
    }

    function _transferTokens(
        address token,
        address from,
        address to,
        uint256 amount
    )
        private
    {
        bytes memory callData = abi.encodeWithSelector(
            IERC20(0).transferFrom.selector,
            from,
            to,
            amount
        );
        (bool success, bytes memory resultData) = token.call(callData);
        if (!success) {
            assembly { revert(add(resultData, 32), mload(resultData)) }
        }
    }
}
