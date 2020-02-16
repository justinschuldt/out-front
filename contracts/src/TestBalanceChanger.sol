pragma solidity ^0.6;

import './IERC20.sol';

contract TestBalanceChanger {

    function change(address token, address owner) external {
        IERC20(token).transferFrom(owner, address(this), 1);
    }

    function noChange(address token, address owner) external {
        IERC20(token).transferFrom(owner, address(this), 0);
    }
}
