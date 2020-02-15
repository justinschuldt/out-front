pragma solidity ^0.6;

interface IEIP1271Validator {

    function isValidSignature(bytes calldata data, bytes calldata signature)
        external view returns (bytes4);
}
