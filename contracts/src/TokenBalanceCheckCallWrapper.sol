pragma solidity ^0.6;

import './IERC20.sol';

/// @dev To check if a transaction will reduce a token balance, we do an
///      `eth_call` replacing the bytecode at the `to` address with this
///      contract's runtime bytecode and placing the old bytecode at a random
///      address. Then we append to the call data:
///       - the location of the old bytecode
///       - the the token address
///       - the token owner address to the call data
///      This contract will then delegate call to the original contract bytecode
///      with the reconstructed (original) call data, checking the token balance
///      before and after.
contract TokenBalanceCheckCallWrapper {

    fallback() external payable {
        // The new location of the original target contract.
        address target;
        // The ERC20 token we're interested in.
        address token;
        // The owner of the token.
        address owner;
        bytes memory callData;
        assembly {
            callData := mload(0x40)
            mstore(0x40, add(callData, calldatasize()))
            // Minus 96 to ignore the extra, appended data.
            mstore(callData, sub(calldatasize(), 96))
            calldatacopy(add(callData, 32), 0, calldatasize())
            // The replaced contract address, token, and token owner are
            // appended to the calldata.
            target := mload(add(callData, sub(calldatasize(), 64)))
            token := mload(add(callData, sub(calldatasize(), 32)))
            owner := mload(add(callData, sub(calldatasize(), 0)))
        }
        uint256 prevBalance = IERC20(token).balanceOf(owner);
        target.delegatecall(callData);
        uint256 postBalance = IERC20(token).balanceOf(owner);
        require(postBalance >= prevBalance, 'TokenBalanceCheckCallWrapper/FUNDS_REDUCED');
    }
}
