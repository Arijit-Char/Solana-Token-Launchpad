import React, { useState } from "react";
import "./App.scss";
import { Keypair, SystemProgram, Transaction } from "@solana/web3.js";

import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import {
  MINT_SIZE,
  createInitializeMint2Instruction,
  TOKEN_2022_PROGRAM_ID,
  getMinimumBalanceForRentExemptMint,
} from "@solana/spl-token";
export default function TokenLaunchpad() {
  const [name, setName] = useState("");
  const [symbol, setSymbol] = useState("");
  const [image, setImage] = useState("");
  const [supply, setSupply] = useState("");
  const wallet = useWallet();
  const {connection} = useConnection();
  async function createMint() {
    if(!wallet.publicKey){
        alert("Connect your wallet first");
        return;
    }
    const keypair = Keypair.generate();

    const lamports = await getMinimumBalanceForRentExemptMint(connection);
    const transaction = new Transaction().add(
      SystemProgram.createAccount({
        fromPubkey: wallet.publicKey,
        newAccountPubkey: keypair.publicKey,
        space: MINT_SIZE,
        lamports,
        programId:TOKEN_2022_PROGRAM_ID,
      }),
      
      createInitializeMint2Instruction(
        keypair.publicKey,
        9,
        wallet.publicKey,
        wallet.publicKey,
        TOKEN_2022_PROGRAM_ID
      )
    );

    transaction.feePayer = wallet.publicKey;
    transaction.recentBlockhash = (
      await connection.getLatestBlockhash()
    ).blockhash;
    transaction.partialSign(keypair);
    
    await wallet.sendTransaction(transaction, connection);

    console.log("Mint created: ", keypair.publicKey.toBase58());
  }
  return (
    <div className="TokenLaunchpad">
      <h1>Solana Token Launchpad</h1>
      <input
        className="inputText"
        type="text"
        placeholder="Name"
        onChange={(e) => setName(e.target.value)}
      ></input>{" "}
      <br />
      <input
        className="inputText"
        type="text"
        placeholder="Symbol"
        onChange={(e) => setSymbol(e.target.value)}
      ></input>{" "}
      <br />
      <input
        className="inputText"
        type="text"
        placeholder="Image URL"
        onChange={(e) => setImage(e.target.value)}
      ></input>{" "}
      <br />
      <input
        className="inputText"
        type="text"
        placeholder="Initial Supply"
        onChange={(e) => setSupply(e.target.value)}
      ></input>{" "}
      <br />
      <button className="btn" onClick={createMint}>
        Create a token
      </button>
    </div>
  );
}
