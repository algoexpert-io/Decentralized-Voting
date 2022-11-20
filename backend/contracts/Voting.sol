// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

contract Voting {
    uint256 nextVoteId;

    struct Vote {
        string uri;
        address owner;
        uint256 endTime;
        uint256[] votes;
        mapping(address => bool) voted;
        uint256 options;
    }

    mapping(uint256 => Vote) votes;
    mapping(address => bool) public members;

    event MemberJoined(address indexed member, uint256 joinedAt);
    event VoteCreated(
        address indexed owner,
        uint256 indexed voteId,
        uint256 indexed createdAt,
        uint256 endTime
    );
    event Voted(
        address indexed voter,
        uint256 indexed voteId,
        uint256 indexed option,
        uint256 createdAt
    );

    modifier isMember() {
        require(members[msg.sender], "you are not a member");
        _;
    }

    modifier canVote(uint256 voteId, uint256 option) {
        require(voteId < nextVoteId, "vote does not exist");
        require(option < votes[voteId].options, "invalid option");
        require(!votes[voteId].voted[msg.sender], "you have already voted");
        require(block.timestamp <= votes[voteId].endTime, "vote has ended");
        _;
    }

    function join() external {
        require(!members[msg.sender], "you are already a member");
        members[msg.sender] = true;
        emit MemberJoined(msg.sender, block.timestamp);
    }

    function createVote(
        string memory uri,
        uint256 endTime,
        uint256 options
    ) external isMember {
        require(
            options >= 2 && options <= 8,
            "number of options must be between 2 and 8"
        );
        require(endTime > block.timestamp, "end time cannot be in past");
        uint256 voteId = nextVoteId;

        votes[voteId].uri = uri;
        votes[voteId].owner = msg.sender;
        votes[voteId].endTime = endTime;
        votes[voteId].options = options;
        votes[voteId].votes = new uint256[](options);

        emit VoteCreated(msg.sender, voteId, block.timestamp, endTime);
        nextVoteId++;
    }

    function vote(uint256 voteId, uint256 option)
        external
        isMember
        canVote(voteId, option)
    {
        votes[voteId].votes[option] = votes[voteId].votes[option] + 1;
        votes[voteId].voted[msg.sender] = true;
        emit Voted(msg.sender, voteId, option, block.timestamp);
    }

    function getVote(uint256 voteId)
        public
        view
        returns (
            string memory,
            address,
            uint256[] memory,
            uint256
        )
    {
        return (
            votes[voteId].uri,
            votes[voteId].owner,
            votes[voteId].votes,
            votes[voteId].endTime
        );
    }

    function didVote(address member, uint256 voteId)
        public
        view
        returns (bool)
    {
        return votes[voteId].voted[member];
    }
}
