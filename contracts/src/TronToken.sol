pragma solidity ^0.6;

import './IERC20.sol';
import './LibSafeMath.sol';

contract TronToken is IERC20 {

    using LibSafeMath for uint256;

    uint8 public override decimals = 18;
    string public symbol = 'TRX';
    uint256 public totalSupply = 1337e18;
    mapping(address => uint256) public override balanceOf;
    mapping(address => mapping(address => uint256)) public override allowance;

    // A minting backdoor, just like with real $TRON.
    function mint(uint256 amount) external {
        balanceOf[msg.sender] = balanceOf[msg.sender].add(amount);
    }

    function transfer(address to, uint256 amount) external override returns (bool) {
        return transferFrom(msg.sender, to, amount);
    }

    function approve(address spender, uint256 amount) external override returns (bool) {
        allowance[msg.sender][spender] = amount;
        emit Approval(msg.sender, spender, amount);
        return true;
    }

    function transferFrom(address owner, address to, uint256 amount) public override returns (bool) {
        if (msg.sender != owner && allowance[owner][msg.sender] != uint256(-1)) {
            allowance[owner][msg.sender] = allowance[owner][msg.sender].sub(amount);
        }
        balanceOf[owner] = balanceOf[owner].sub(amount);
        balanceOf[to] = balanceOf[to].add(amount);
        emit Transfer(owner, to, amount);
        return true;
    }
}
