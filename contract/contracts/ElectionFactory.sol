// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "hardhat/console.sol";

contract ElectionFactory {
    constructor() {
        console.log("Here is my first smart contract!");
    }

    struct Candidate {
        string name;
        string publicPromise;
        address myAddress;
        uint voteCount;
    }
    struct Voter {
        address voterAddress;
    }
    Candidate[] public candidates;
    Voter[] public voters;

    mapping(address => uint) addressToCandidateId;
    mapping(uint => Candidate) candidateIdToCandidateInfo;
    uint electionPeriod;
    uint electionDuration = 3 minutes;
    uint sumOfCandidates;
    uint sumOfVoters;
    string currentChairman;

    event StartNewElection(uint electionPeriod);
    event NewCandidate(
        address candidateAddress,
        string name,
        string publicPromise
    );
    event VoteSomeone(
        address indexed from,
        address indexed to,
        string candidateName
    );
    event VoteAbstain(address indexed from);
    event NewChairman(
        string newChairmanName,
        string publicPromise,
        uint voteCount
    );

    modifier onlyNoncandidate() {
        for (uint i = sumOfCandidates; i < candidates.length; i++) {
            require(candidates[i].myAddress != msg.sender);
        }
        _;
    }

    modifier checkFirstTimeVote() {
        for (uint i = sumOfVoters; i < voters.length; i++) {
            require(msg.sender != voters[i].voterAddress);
        }
        _;
    }

    modifier checkIfNotFinish() {
        require(electionPeriod > block.timestamp);
        _;
    }

    modifier checkIfFinished() {
        require(electionPeriod < block.timestamp);
        _;
    }

    function RunForChairman(string memory _name, string memory _publicPromise)
        public
        onlyNoncandidate
    {
        _StartElection();
        candidates.push(Candidate(_name, _publicPromise, msg.sender, 0));
        addressToCandidateId[msg.sender] = candidates.length - 1;
        candidateIdToCandidateInfo[candidates.length - 1] = candidates[
            candidates.length - 1
        ];
        emit NewCandidate(msg.sender, _name, _publicPromise);
    }

    function Vote(address _to)
        public
        checkFirstTimeVote
        onlyNoncandidate
        checkIfNotFinish
    {
        uint candidateId;
        voters.push(Voter(msg.sender));
        candidateId = addressToCandidateId[_to];
        candidates[candidateId].voteCount++;
        emit VoteSomeone(msg.sender, _to, candidates[candidateId].name);
    }

    function VoteToAbstain() public checkFirstTimeVote checkIfNotFinish {
        voters.push(Voter(msg.sender));
        emit VoteAbstain(msg.sender);
    }

    function _StartElection() private {
        if (electionPeriod < block.timestamp) {
            electionPeriod = block.timestamp + electionDuration;
            console.log(electionPeriod);
            emit StartNewElection(electionPeriod);
        }
    }

    function _DecideNewChairman()
        private
        view
        returns (uint winnerId, uint mostVotedNum)
    {
        for (uint i = sumOfCandidates; i < candidates.length; i++) {
            if (candidates[i].voteCount > mostVotedNum) {
                mostVotedNum = candidates[i].voteCount;
                winnerId = i;
            }
        }
        console.log(winnerId);
        console.log(mostVotedNum);
        return (winnerId, mostVotedNum);
    }

    function FinishElection() public checkIfFinished returns (string memory) {
        uint mostVotedNum;
        uint winnerId;
        (winnerId, mostVotedNum) = _DecideNewChairman();
        sumOfCandidates = candidates.length;
        sumOfVoters = voters.length;
        currentChairman = candidates[winnerId].name;
        emit NewChairman(
            candidates[winnerId].name,
            candidates[winnerId].publicPromise,
            mostVotedNum
        );
        console.log(candidates[winnerId].name);
        return (candidates[winnerId].name);
    }

    function GetNewChairman() public view returns (string memory) {
        return (currentChairman);
    }

    function GetAllCandidates() public view returns (Candidate[] memory) {
        return candidates;
    }

    function GetElectionPeriod() public view returns (uint) {
        return (electionPeriod);
    }
}
