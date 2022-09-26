import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import abi from "./utils/ElectionFactory.json";
import {
  AppBar,
  Button,
  CssBaseline,
  Stack,
  Box,
  Toolbar,
  Typography,
  Container,
  createTheme,
  ThemeProvider,
  Modal,
  TextField,
  Autocomplete,
} from "@mui/material";

const theme = createTheme();
const contractAddress = "0xeA10bE9eD584063c653157Fcd1BDa87E2cF320cD";
const contractABI = abi.abi;

export default function App() {
  //当選者用の定数
  const [currentChairman, setCurrentChairman] = useState("");
  //選挙期間の定数
  const [electionPeriod, setElectionPeriod] = useState();
  // スマコンから全候補者情報を受け取るための配列
  const [allCandidates, setAllCandidates] = useState([]);
  //立候補者用modal用の定数
  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  //立候補者情報の保存のための定数
  const [name, setName] = useState("");
  const [publicPromise, setPublicPromise] = useState("");
  //VoteModalの定数
  const [voteOpen, setVoteOpen] = React.useState(false);
  const handleVoteOpen = () => setVoteOpen(true);
  const handleVoteClose = () => setVoteOpen(false);
  //Voteメソッド用変数
  const [candidateAddress, setCandidateAddress] = useState(0);
  // ユーザーのパブリックウォレットを保存するために使用する状態変数を定義します。
  const [currentAccount, setCurrentAccount] = useState("");
  console.log("currentAccount: ", currentAccount);
  // window.ethereumにアクセスできることを確認します。
  const checkIfWalletIsConnected = async () => {
    try {
      const { ethereum } = window;
      if (!ethereum) {
        console.log("Make sure you have MetaMask!");
        return;
      } else {
        console.log("We have the ethereum object", ethereum);
      }
      // ユーザーのウォレットへのアクセスが許可されているかどうかを確認します。
      const accounts = await ethereum.request({ method: "eth_accounts" });
      if (accounts.length !== 0) {
        const account = accounts[0];
        console.log("Found an authorized account:", account);
        setCurrentAccount(account);
        getAllCandidates();
      } else {
        console.log("No authorized account found");
      }
    } catch (error) {
      console.log(error);
    }
  };
  // connectWalletメソッドを実装
  const connectWallet = async () => {
    try {
      const { ethereum } = window;
      if (!ethereum) {
        alert("Get MetaMask!");
        return;
      }
      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });
      console.log("Connected: ", accounts[0]);
      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log(error);
    }
  };
  //立候補者情報の配列への追加と、スマコンメソッドの実行
  const submitCandidateInfo = () => {
    RunFor();
  };
  //voteボタンを押した時の処理、スマコンの実行
  const voteCandidate = () => {
    Vote();
  };
  //棄権票ボタンをプッシュした際の処理、voteToAbstainメソッドの実行
  const voteAbstain = async () => {
    VoteToAbstain();
    console.log("You voted to abstain.");
  };

  //スマコン側のメソッドの実装
  // candidates配列の取得メソッド
  const getAllCandidates = async () => {
    const { ethereum } = window;
    try {
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const electionPortalContract = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );
        const candidates = await electionPortalContract.GetAllCandidates();
        const candidatesCleaned = candidates.map((candidate) => {
          return {
            address: candidate.myAddress,
            name: candidate.name,
            publicPromise: candidate.publicPromise,
          };
        });
        setAllCandidates(candidatesCleaned);
      } else {
        console.log("Ethereum object doesn't exit!");
      }
    } catch (error) {
      console.log(error);
    }
  };

  //立候補メソッド
  const RunFor = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const electionPortalContract = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );
        const runForTxn = await electionPortalContract.RunForChairman(
          name,
          publicPromise,
          { gasLimit: 500000 }
        );
        console.log("Mining...", runForTxn.hash);
        await runForTxn.wait();
        console.log("Mined --", runForTxn.hash);
      } else {
        console.log("Ethereum object doesn't exiat!");
      }
    } catch (error) {
      console.log(error);
    }
  };
  //選挙期間取得メソッド
  const GetElectionPeriod = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const electionPortalContract = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );
        const getElectionPeriodTxn =
          await electionPortalContract.GetElectionPeriod();
        let dateTime = new Date(getElectionPeriodTxn * 1000);
        setElectionPeriod(dateTime.toString());
      } else {
        console.log("Ethereum object doesn't exiat!");
      }
    } catch (error) {
      console.log(error);
    }
  };
  // 投票メソッド
  const Vote = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const electionPortalContract = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );
        const voteTxn = await electionPortalContract.Vote(candidateAddress);
        console.log("Mining...", voteTxn.hash);
        await voteTxn.wait();
        console.log("Mined --", voteTxn.hash);
        console.log("You voted to", candidateAddress);
      } else {
        console.log("Ethereum object doesn't exiat!");
      }
    } catch (error) {
      console.log(error);
    }
  };
  // 棄権票メソッド
  const VoteToAbstain = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const electionPortalContract = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );
        const voteToAbstainTxn = await electionPortalContract.VoteToAbstain();
        console.log("Mining...", voteToAbstainTxn.hash);
        await voteToAbstainTxn.wait();
        console.log("Mined --", voteToAbstainTxn.hash);
      } else {
        console.log("Ethereum object doesn't exiat!");
      }
    } catch (error) {
      console.log(error);
    }
  };
  // 選挙終了メソッド
  const FinishElection = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const electionPortalContract = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );
        const finishElectionTxn = await electionPortalContract.FinishElection();
        console.log("Mining...", finishElectionTxn.hash);
        await finishElectionTxn.wait();
        console.log(finishElectionTxn);
        console.log("allCandidates:", allCandidates);
        console.log(electionPeriod);
        console.log("Mined --", finishElectionTxn.hash);
        GetNewChairman();
      } else {
        console.log("Ethereum object doesn't exiat!");
      }
    } catch (error) {
      console.log(error);
    }
  };

  // 当選者取得メソッド
  const GetNewChairman = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const electionPortalContract = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );
        const getNewChairman = await electionPortalContract.GetNewChairman();
        console.log("New chairman is ", getNewChairman);
        setCurrentChairman(getNewChairman);
      } else {
        console.log("Ethereum object doesn't exiat!");
      }
    } catch (error) {
      console.log(error);
    }
  };

  // modal用の定数
  const style = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: 400,
    bgcolor: "background.paper",
    border: "2px solid #000",
    boxShadow: 24,
    p: 4,
  };

  // WEBページがロードされたときに下記の関数を実行します。
  useEffect(() => {
    let electionPortalContract;

    const onNewCandidate = (candidateAddress, name, publicPromise) => {
      console.log("NewCandidate", candidateAddress, name, publicPromise);
      setAllCandidates((prevState) => [
        ...prevState,
        {
          address: candidateAddress,
          name: name,
          publicPromise: publicPromise,
        },
      ]);
    };

    /* NewWaveイベントがコントラクトから発信されたときに、情報を受け取ります */
    if (window.ethereum) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();

      electionPortalContract = new ethers.Contract(
        contractAddress,
        contractABI,
        signer
      );
      electionPortalContract.on("NewCandidate", onNewCandidate);
    }
    /*メモリリークを防ぐために、イベントを解除します*/
    return () => {
      if (electionPortalContract) {
        electionPortalContract.off("NewCandidate", onNewCandidate);
      }
    };
  }, []);

  // 立ち上げ時に、walletの接続確認、選挙期間の取得、表示を行う
  useEffect(() => {
    checkIfWalletIsConnected();
    GetElectionPeriod();
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {/* Header */}
      <AppBar position="relative">
        <Toolbar>
          <Typography variant="h6" color="inherit" noWrap>
            SMART GOVERMENT
          </Typography>
          <div style={{ flexGrow: 1 }}></div>
          {/* ウォレットコネクトのボタンを実装 */}
          {!currentAccount && (
            <Button
              variant="outlined"
              color="inherit"
              noWrap
              onClick={connectWallet}
            >
              Connect Wallet
            </Button>
          )}
          {currentAccount && (
            <Button
              variant="outlined"
              color="inherit"
              noWrap
              onClick={connectWallet}
            >
              Wallet Connected
            </Button>
          )}
        </Toolbar>
      </AppBar>
      {/* Main */}
      <main>
        <Box
          sx={{
            bgcolor: "background.paper",
            pt: 8,
            pb: 6,
          }}
        >
          <Container maxWidth="sm">
            <Stack
              sx={{ pt: 4 }}
              direction="row"
              spacing={2}
              justifyContent="center"
            >
              {/* 立候補用ボタンと情報入力用のModal */}
              <div>
                <Button variant="contained" onClick={handleOpen}>
                  Run for Chairman
                </Button>
                <Modal
                  open={open}
                  onClose={handleClose}
                  aria-labelledby="modal-modal-title"
                  aria-describedby="modal-modal-description"
                >
                  {/* //Modal内、名前、公約入力画面 */}
                  <Box sx={style}>
                    <Typography
                      id="modal-modal-title"
                      variant="h6"
                      component="h2"
                    >
                      Fill in the following fields.
                    </Typography>
                    <Box
                      component="form"
                      sx={{
                        "& > :not(style)": { m: 1, width: "25ch" },
                      }}
                      noValidate
                      autoComplete="off"
                    >
                      <TextField
                        value={name}
                        onChange={(event) => setName(event.target.value)}
                        label="Name"
                        variant="standard"
                      />
                      <TextField
                        value={publicPromise}
                        onChange={(event) =>
                          setPublicPromise(event.target.value)
                        }
                        label="Public Promise"
                        variant="standard"
                      />
                      <Button variant="contained" onClick={submitCandidateInfo}>
                        Submit
                      </Button>
                    </Box>
                  </Box>
                </Modal>
              </div>
              {/* 投票用ボタンと情報入力用のModal */}
              <div>
                <Button variant="outlined" onClick={handleVoteOpen}>
                  Vote to candidate
                </Button>
                <Modal
                  open={voteOpen}
                  onClose={handleVoteClose}
                  aria-labelledby="modal-modal-title"
                  aria-describedby="modal-modal-description"
                >
                  <Box sx={style}>
                    <Typography
                      id="modal-modal-title"
                      variant="h6"
                      component="h2"
                    >
                      Choose candidate you vote.
                    </Typography>
                    {/* // 投票先候補者選択画面 */}
                    <Autocomplete
                      id="country-select-demo"
                      sx={{ width: 300 }}
                      options={allCandidates}
                      autoHighlight
                      getOptionLabel={(option) => option.name}
                      renderOption={(props, option) => (
                        <Box
                          component="li"
                          sx={{ "& > img": { mr: 2, flexShrink: 0 } }}
                          {...props}
                        >
                          {option.name}
                        </Box>
                      )}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Choose a candidate"
                          inputProps={{
                            ...params.inputProps,
                            autoComplete: "new-password", // disable autocomplete and autofill
                          }}
                        />
                      )}
                    />
                    <TextField
                      value={candidateAddress}
                      onChange={(event) =>
                        setCandidateAddress(event.target.value)
                      }
                      variant="outlined"
                      label="Candidate's Address"
                    ></TextField>
                    <Button variant="outlined" onClick={voteCandidate}>
                      vote
                    </Button>
                  </Box>
                </Modal>
              </div>
              {/* 棄権票用ボタン */}
              <Button variant="outlined" onClick={voteAbstain}>
                vote to abstain
              </Button>
            </Stack>
          </Container>
        </Box>

        {/* 選挙終了時に使うFinish Electionメソッド */}
        <Box
          sx={{
            bgcolor: "background.paper",
            pt: 8,
            pb: 6,
          }}
        >
          <Container maxWidth="sm">
            <Stack
              sx={{ pt: 4 }}
              direction="row"
              spacing={2}
              justifyContent="center"
            >
              <Button
                variant="contained"
                align="center"
                onClick={FinishElection}
              >
                Finish Election
              </Button>
            </Stack>
          </Container>
        </Box>
        {/* 立候補者情報の表示 */}
        {currentAccount &&
          allCandidates
            .slice(0)
            .reverse()
            .map((candidate, index) => {
              return (
                <div
                  key={index}
                  style={{
                    backgroundColor: "#F8F8FF",
                    marginTop: "16px",
                    padding: "8px",
                  }}
                >
                  <div>Address: {candidate.address}</div>
                  <div>Name: {candidate.name}</div>
                  <div>PublicPromise: {candidate.publicPromise}</div>
                </div>
              );
            })}
        {/* この選挙の終了時間を記載 */}
        <div>This election will finsh at {electionPeriod}</div>
        {/* 現在の会長を表示 */}
        <div>Current Chairman: {currentChairman}</div>
      </main>
    </ThemeProvider>
  );
}
