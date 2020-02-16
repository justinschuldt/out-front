pragma solidity ^0.6;

import './IERC20.sol';
import './TronToken.sol';

contract TestBalanceChanger {

    function mint(address token, uint256 amount) external {
        TronToken(token).mint(amount);
    }

    function approve(address token, address spender, uint256 amount) external {
        IERC20(token).approve(spender, amount);
    }

    function changeBalance(address token, address recipient) external {
        IERC20(token).transfer(recipient, 1);
    }

    function noChangeBalance(address token, address recipient) external {
        IERC20(token).transfer(recipient, 0);
    }

    function changeAllowance(address token, address spender) external {
        uint256 allowance = IERC20(token).allowance(address(this), spender);
        require(allowance > 0, 'TestBalanceChanger/NO_ALLOWANCE');
        IERC20(token).approve(spender, allowance - 1);
    }

    function noChangeAllowance(address token, address spender) external {
        uint256 allowance = IERC20(token).allowance(address(this), spender);
        IERC20(token).approve(spender, allowance);
    }
}
