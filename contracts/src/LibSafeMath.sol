pragma solidity ^0.6;

library LibSafeMath {
    function sub(uint256 a, uint256 b) internal pure returns (uint256 c) {
        c = a - b;
        require(c <= a, 'TronToken/SUBTRACTION_UNDERFLOW');
    }

    function add(uint256 a, uint256 b) internal pure returns (uint256 c) {
        c = a + b;
        require(c >= a, 'TronToken/ADDITION_UNDERFLOW');
    }
}
