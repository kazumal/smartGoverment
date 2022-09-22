const main  = async ()=> {
  const [owner, randomPerson,randomPerson2] =await hre.ethers.getSigners()
  const contractFactory = await hre.ethers.getContractFactory("ElectionFactory");
  const contract = await contractFactory.deploy();
  const electionFactory = await contract.deployed();

  console.log("Contract deployed to:", electionFactory.address);
  console.log("Contract deployed by:", owner.address);

  let runFor;
  runFor = await contract.RunForChairman("Takashi","We can do it!");
  await runFor.wait();

  let vote;
  vote = await contract.Vote(randomPerson.address, owner.address);
  await vote.wait();
  let vote2;
  vote2 = await contract.Vote(randomPerson2.address, owner.address);
  await vote2.wait();

  let finish;
  finish = await contract.FinishElection();
};

const runMain = async() => {
  try{
    await main();
    process.exit(0);
  } catch (error){
    console.log(error);
    process.exit(1);
  }
};

runMain();