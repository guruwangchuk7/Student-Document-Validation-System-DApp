// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

/**
 * @title CertificateRegistry
 * @dev A registry for educational certificates stored as hashes (SHA256).
 * This contract acts as the "Trust Layer" in the Web 2.5 architecture.
 */
contract CertificateRegistry {
    // --- State Variables ---
    address public owner;

    struct Certificate {
        bytes32 certificateHash; // The SHA256 hash of the certificate PDF
        address issuer;          // The address of the university/authority that issued it
        uint256 timestamp;       // When it was anchored on-chain
        bool exists;             // Registry check
    }

    // Mapping from hash to Certificate data
    mapping(bytes32 => Certificate) public certificates;

    // --- Events ---
    event CertificateIssued(bytes32 indexed certificateHash, address indexed issuer, uint256 timestamp);

    // --- Modifiers ---
    modifier onlyOwner() {
        require(msg.sender == owner, "Not the owner");
        _;
    }

    // --- Constructor ---
    constructor(address _owner) {
        owner = _owner;
    }

    // --- Functions ---

    /**
     * @notice Registers a new certificate hash on-chain.
     * @param _hash The SHA256 hash of the document (passed as bytes32).
     */
    function registerCertificate(bytes32 _hash) public {
        require(!certificates[_hash].exists, "Certificate already registered");

        certificates[_hash] = Certificate({
            certificateHash: _hash,
            issuer: msg.sender,
            timestamp: block.timestamp,
            exists: true
        });

        emit CertificateIssued(_hash, msg.sender, block.timestamp);
    }

    /**
     * @notice Verifies if a certificate hash exists on-chain.
     * @param _hash The hash to check.
     */
    function verifyCertificate(bytes32 _hash) public view returns (bool, address, uint256) {
        Certificate memory cert = certificates[_hash];
        return (cert.exists, cert.issuer, cert.timestamp);
    }

    /**
     * @notice Transfer ownership of the registry.
     */
    function transferOwnership(address _newOwner) public onlyOwner {
        owner = _newOwner;
    }
}
