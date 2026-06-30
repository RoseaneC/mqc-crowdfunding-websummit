// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IERC20 {
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
}

contract ImpactDonationRouter {
    address public owner;
    address public immutable usdglo;
    bool public paused;

    struct ProjectReceiver {
        address wallet;
        bool approved;
    }

    mapping(bytes32 => ProjectReceiver) public projects;

    event ProjectConfigured(bytes32 indexed projectId, address indexed wallet, bool approved);
    event DonationReceived(
        bytes32 indexed projectId,
        address indexed donor,
        address indexed projectWallet,
        uint256 amount,
        string reference
    );
    event NativeDonationReceived(
        bytes32 indexed projectId,
        address indexed donor,
        address indexed projectWallet,
        uint256 amount,
        string reference
    );
    event Paused(bool paused);
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    modifier onlyOwner() {
        require(msg.sender == owner, "NOT_OWNER");
        _;
    }

    modifier whenNotPaused() {
        require(!paused, "PAUSED");
        _;
    }

    constructor(address usdgloAddress) {
        require(usdgloAddress != address(0), "USDGLO_REQUIRED");
        owner = msg.sender;
        usdglo = usdgloAddress;
    }

    function configureProject(bytes32 projectId, address wallet, bool approved) external onlyOwner {
        require(projectId != bytes32(0), "PROJECT_REQUIRED");
        require(wallet != address(0), "WALLET_REQUIRED");

        projects[projectId] = ProjectReceiver({ wallet: wallet, approved: approved });

        emit ProjectConfigured(projectId, wallet, approved);
    }

    function donateUSDGLO(bytes32 projectId, uint256 amount, string calldata reference) external whenNotPaused {
        ProjectReceiver memory project = projects[projectId];

        require(project.approved, "PROJECT_NOT_APPROVED");
        require(project.wallet != address(0), "PROJECT_WALLET_REQUIRED");
        require(amount > 0, "AMOUNT_REQUIRED");

        bool ok = IERC20(usdglo).transferFrom(msg.sender, project.wallet, amount);
        require(ok, "TRANSFER_FAILED");

        emit DonationReceived(projectId, msg.sender, project.wallet, amount, reference);
    }

    function donateCELO(bytes32 projectId, string calldata reference) external payable whenNotPaused {
        ProjectReceiver memory project = projects[projectId];

        require(project.approved, "PROJECT_NOT_APPROVED");
        require(project.wallet != address(0), "PROJECT_WALLET_REQUIRED");
        require(msg.value > 0, "AMOUNT_REQUIRED");

        (bool ok, ) = payable(project.wallet).call{ value: msg.value }("");
        require(ok, "NATIVE_TRANSFER_FAILED");

        emit NativeDonationReceived(projectId, msg.sender, project.wallet, msg.value, reference);
    }

    function setPaused(bool value) external onlyOwner {
        paused = value;
        emit Paused(value);
    }

    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "OWNER_REQUIRED");
        emit OwnershipTransferred(owner, newOwner);
        owner = newOwner;
    }
}
