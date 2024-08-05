import {
  Box,
  Button,
  Container,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import {
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  Connection,
  SystemProgram,
  TransactionMessage,
  VersionedTransaction,
} from "@solana/web3.js";
import React, { useContext, useEffect, useState } from "react";
import { useRef } from "react";
import Layout from "../../layouts";
import { enqueueSnackbar } from "notistack";

import {
  useConnection,
  useWallet,
  ConnectionContext,
  WalletContext,
} from "@solana/wallet-adapter-react";

const TO_PUBLIC_KEY = "CZmVK1DymrSVWHiQCGXx6VG5zgHVrh5J1P514jHKRDxA";

export default function HomePage() {
  const { publicKey, sendTransaction } = useWallet();
  const [balance, setBalance] = useState(0);
  const [toPublicKey, setToPublicKey] = useState(TO_PUBLIC_KEY);
  const [toCount, setToCount] = useState(10000000);
  const { connection } = useConnection();
  const onToPublicKey = (e) => {
    setToPublicKey(e.target.value);
  };

  const onToCount = (e) => {
    setToCount(e.target.value * LAMPORTS_PER_SOL);
  };

  const onTransfer = async () => {
    enqueueSnackbar(`transfer to ${toPublicKey} ${toCount} SOL`);
    enqueueSnackbar(`SystemProgram: ${SystemProgram.programId.toBase58()}`);
    const txInstructions = [
      SystemProgram.transfer({
        fromPubkey: publicKey, //this.publicKey,
        toPubkey: new PublicKey(toPublicKey), //destination,
        lamports: toCount, //amount,
      }),
    ];

    const {
      context: { slot: minContextSlot },
      value: { blockhash, lastValidBlockHeight },
    } = await connection.getLatestBlockhashAndContext();
    //let latestBlockhash = await connection.getLatestBlockhash("finalized");
    enqueueSnackbar(
      `   ✅ - Fetched latest blockhash. Last Valid Height: 
      ${lastValidBlockHeight}`
    );
    console.log("slot:", minContextSlot);
    console.log("latestBlockhash:", blockhash);

    const messageV0 = new TransactionMessage({
      payerKey: publicKey,
      recentBlockhash: blockhash,
      instructions: txInstructions,
    }).compileToV0Message();

    const trx = new VersionedTransaction(messageV0);
    const signature = await sendTransaction(trx, connection, {
      minContextSlot,
    });
    console.log("signature:", signature);
  };

  const onBalance = () => {
    console.log("wallet is ", publicKey);
    connection.getBalance(publicKey).then((balance) => {
      enqueueSnackbar(`${publicKey} has a balance of ${balance}`);
      setBalance(balance);
    });
  };


  return (
      <Box
        sx={{
          bgcolor: "background.paper",
          pt: 8,
          pb: 6,
        }}
      >
        <Container maxWidth="sm">
          <Typography
            component="h1"
            variant="h2"
            align="center"
            color="text.primary"
            gutterBottom
          >
            Wallet Adatpter
          </Typography>
          <Typography
            variant="h5"
            align="center"
            color="text.secondary"
            paragraph
          >
            Modular TypeScript wallet adapters and components for Solana
            applications.
          </Typography>
    

          <Stack
            sx={{ pt: 4 }}
            direction="row"
            spacing={2}
            justifyContent="center"
          >
            <Container>
              <React.Fragment>
                <span>Balance:{balance / LAMPORTS_PER_SOL} </span>
                <Button onClick={onBalance}> Query Balance </Button>
              </React.Fragment>
              <React.Fragment>
                <div>
                  <TextField label="To" onChange={onToPublicKey} />
                  <TextField label="Count" onChange={onToCount} />
                  <Button onClick={onTransfer}> Transfer </Button>
                </div>
              </React.Fragment>
            </Container>
          </Stack>
        </Container>
      </Box>
  );
}
