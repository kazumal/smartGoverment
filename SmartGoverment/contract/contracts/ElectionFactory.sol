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
        emit NewCandidate(msg.sender, _name, _publicPromise);
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

    function GetElectionPeriod() public view returns (uint) {
        return (electionPeriod);
    }

    function Vote(address _to)
        public
        checkFirstTimeVote // onlyNoncandidate
    {
        uint candidateId;
        voters.push(Voter(msg.sender));
        candidateId = addressToCandidateId[_to];
        candidates[candidateId].voteCount++;
        emit VoteSomeone(msg.sender, _to, candidates[candidateId].name);
    }

    function VoteToAbstain() public checkFirstTimeVote {
        voters.push(Voter(msg.sender));
        emit VoteAbstain(msg.sender);
    }

    function _StartElection() private checkFirstCandidate {
        electionPeriod = block.timestamp + electionDuration;
        console.log(electionPeriod);
        emit StartNewElection(electionPeriod);
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

    //modifier checkFinishTimeを忘れずに
    function FinishElection() public returns (string memory) {
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
}
