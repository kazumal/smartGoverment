const main = async () => {
  const [owner, randomPerson, randomPerson2] = await hre.ethers.getSigners();
  const contractFactory = await hre.ethers.getContractFactory(
    "ElectionFactory"
  );
  const contract = await contractFactory.deploy();
  const electionFactory = await contract.deployed();

  console.log("Contract deployed to:", electionFactory.address);
  console.log("Contract deployed by:", owner.address);

  let runFor;
  runFor = await contract.RunForChairman("Takashi", "We can do it!");
  await runFor.wait();

  let getElectionPeriod;
  getElectionPeriod = await contract.GetElectionPeriod();
  console.log(getElectionPeriod.toString());
  console.log(getElectionPeriod.toString());
  let dateTime = new Date(getElectionPeriod * 1000);
  console.log(dateTime.toString());

  let getAllCandidates;
  getAllCandidates = await contract.GetAllCandidates();
  console.log(getAllCandidates);
  console.log(getAllCandidates[0].name);

  let vote;
  vote = await contract.Vote("0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266");
  await vote.wait();
  console.log("Vote func is fine");

  let vote2;
  vote2 = await contract.Vote("0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266");
  await vote2.wait();
  console.log("vote2 func is fine");

  let newChairman;
  newChairman = await contract.FinishElection();
  console.log(newChairman);

  let getNewChairman;
  getNewChairman = await contract.GetNewChairman();
  console.log(getNewChairman);
  console.log("Finish election");
};

const runMain = async () => {
  try {
    await main();
    process.exit(0);
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

runMain();
