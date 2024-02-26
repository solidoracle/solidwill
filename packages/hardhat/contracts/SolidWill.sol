// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.4;

import "hardhat/console.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

error SolidWillError();

/// @title SolidWill
/// @author @solidoracle
contract SolidWill is Ownable {
    using SafeMath for uint256;
    uint256 public counter;
    address public chiefOperator;
    AggregatorV3Interface internal usdPriceFeed;

    struct Will {
        address owner;
        uint256 frequency;
        uint256 lastConfirmationBlock;
        string fileUrl;
        bool isActive;
    }

    mapping(uint256 => Will) private wills;

    error AlreadyDeceased();
    error ConfirmationWindowNotMet();

    constructor(address _usdPriceFeedAddress) {
        console.log("Deploying the SolidWill Contract; USD Feed Address:", _usdPriceFeedAddress);
        chiefOperator = 0xD0f598821FaAe3Fbec9874f43A25ad3301021817;
        usdPriceFeed = AggregatorV3Interface(_usdPriceFeedAddress);
    }

    function _generateId() private returns (uint256) {
        return counter++;
    }

    function createWill(address _owner, uint256 _frequency) external payable returns (uint256) {
        Will memory newWill = Will({
            owner: _owner,
            frequency: _frequency,
            lastConfirmationBlock: block.number,
            fileUrl: "",
            isActive: true
        });
        uint256 willId = _generateId();
        require(!_willExists(willId), "SolidWill: Will already created");
        uint256 cost = 6 * 10**18;
        if (msg.sender == owner() || msg.sender == chiefOperator) {
            cost = 0;
        }
        require(
            msg.value >= cost,
            "Insufficient send amount"
        );
        wills[willId] = newWill;
        console.log("Will created with ID: ", willId);
        return willId;
    }

    function withdrawFunds() external onlyOwner {
        uint256 funds = address(this).balance;
        address payable recipient = payable(owner());
        recipient.transfer(funds);
    }

    function updateWill(uint256 _willId, string calldata _fileUrl) external returns (bool) {
        require(_willExists(_willId), "SolidWill: Will does not exist");
        require(msg.sender == wills[_willId].owner, "SolidWill: Unauthorized");
        wills[_willId].fileUrl = _fileUrl;
        return true;
    }

    function _willExists(uint256 _willId) internal view returns (bool) {
        return wills[_willId].owner != address(0);
    }

    function confirmLife(uint256 _willId) external returns (bool) {
        require(msg.sender == wills[_willId].owner, "SolidWill: Unauthorized");
        if (!isAlive(_willId)) {
            revert AlreadyDeceased();
        } else {
            wills[_willId].lastConfirmationBlock = block.number;
            console.log("Life confirmed for will ID:", _willId);
            return true;
        }
    }

    function transferOwnershipOfWill(uint256 _willId, address _newOwner) external returns (bool) {
        require(msg.sender == wills[_willId].owner, "SolidWill: Unauthorized");
        if (!isAlive(_willId)) {
            revert AlreadyDeceased();
        } else {
            wills[_willId].owner = _newOwner;
            console.log("Will ownership transferred:", wills[_willId].owner);
            return true;
        }
    }

    function updateFrequency(uint256 _willId, uint256 _newFrequency) external returns (bool) {
        require(msg.sender == wills[_willId].owner, "SolidWill: Unauthorized");
        if (!isAlive(_willId)) {
            revert AlreadyDeceased();
        } else {
            wills[_willId].frequency = _newFrequency;
            console.log("Frequency updated to", wills[_willId].frequency);
            return true;
        }
    }

    function deactivateWill(uint256 _willId) external returns (bool) {
        require(msg.sender == wills[_willId].owner, "SolidWill: Unauthorized");
        if (!isAlive(_willId)) {
            revert AlreadyDeceased();
        } else {
            wills[_willId].isActive = false;
            console.log("Will deactivated:", _willId);
            return true;
        }
    }

    function isAlive(uint256 _willId) public view returns (bool) {
        if (!wills[_willId].isActive) {
            return false;
        }
        return (block.number - wills[_willId].lastConfirmationBlock) <= wills[_willId].frequency;
    }

    function getWillDetails(uint256 _willId) external view returns (Will memory) {
        require(_willExists(_willId), "SolidWill: Will does not exist");
        return wills[_willId];
    }

    function getLatestUsdPrice() public view returns (int) {
        (
            /*uint80 roundID*/,
            int price,
            /*uint startedAt*/,
            /*uint timeStamp*/,
            /*uint80 answeredInRound*/
        ) = usdPriceFeed.latestRoundData();
        return price;
    }

    function calculateMintPrice() public view returns (uint256) {
        int latestPrice = getLatestUsdPrice();
        // Assuming the price is in USD with 8 decimal places
        // and we want to charge $6 for minting a will
        uint256 mintPrice = uint256(latestPrice).mul(6).div(10**8);
        return mintPrice;
    }
}
