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
    uint electionDuration = 1 minutes;
    uint sumOfCandidates;
    uint sumOfVoters;

    event NewElectionStarted(uint electionPeriod);
    event NewCandidate(string name, string publicPromise);
    event VotedCandidate(address indexed from, string name);
    event ElectionFinished(string newChairmanName, uint voteCount);

    modifier onlyNoncandidate() {
        if (sumOfCandidates == 0) {
            _;
        } else {
            for (uint i = sumOfCandidates; i < candidates.length; i++) {
                require(candidates[i].myAddress != msg.sender);
            }
            _;
        }
    }

    modifier checkFirstCandidate() {
        require((candidates.length - sumOfCandidates) == 0);
        _;
    }

    modifier checkFirstTimeVote() {
        if (sumOfVoters == 0) {
            _;
        } else {
            for (uint i = sumOfVoters; i < voters.length; i++) {
                require(msg.sender != voters[i].voterAddress);
            }
            _;
        }
    }

    modifier checkFinishTime() {
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
        emit NewCandidate(_name, _publicPromise);
    }

    function GetAllCandidates() public view returns (Candidate[] memory) {
        return candidates;
    }

    function GetSumOfCandidates() public view returns (uint) {
        console.log("Num of sumOfCandidates is", sumOfCandidates);
        return (sumOfCandidates);
    }

    function GetNumOfCandidates() public view returns (uint) {
        console.log("Num of candidates.length is", candidates.length);
        return (candidates.length);
    }

    function Vote(address _candidateAddress)
        public
        checkFirstTimeVote
    // onlyNoncandidate
    {
        uint candidateId;
        voters.push(Voter(msg.sender));
        candidateId = addressToCandidateId[_candidateAddress];
        candidates[candidateId].voteCount++;
        emit VotedCandidate(msg.sender, candidates[candidateId].name);
    }

    function VoteToAbstain() public checkFirstTimeVote {
        voters.push(Voter(msg.sender));
        console.log("You voted to abstain.");
    }

    function _StartElection() private checkFirstCandidate {
        electionPeriod = block.timestamp + electionDuration;
        emit NewElectionStarted(electionPeriod);
    }

    function GetFinishTime() public view returns (uint) {
        console.log(
            "This election will finish at",
            electionPeriod,
            "on Linux Time."
        );
        return (electionPeriod);
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
        return (winnerId, mostVotedNum);
    }

    function FinishElection() public checkFinishTime returns (string memory) {
        uint mostVotedNum;
        uint winnerId;
        (winnerId, mostVotedNum) = _DecideNewChairman();
        sumOfCandidates = candidates.length;
        sumOfVoters = voters.length;
        emit ElectionFinished(candidates[winnerId].name, mostVotedNum);
        return (candidates[winnerId].name);
    }
}
