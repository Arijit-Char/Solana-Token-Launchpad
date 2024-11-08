import React, { useState } from "react";
import "./App.scss";
import { Keypair, SystemProgram, Transaction } from "@solana/web3.js";

import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import {
  ExtensionType,
  TOKEN_2022_PROGRAM_ID,
  createInitializeMintInstruction,
  getMintLen,
  createInitializeMetadataPointerInstruction,
  TYPE_SIZE,
  LENGTH_SIZE,
  getAssociatedTokenAddressSync,
  createAssociatedTokenAccountInstruction,
  createMintToInstruction,
  getTokenMetadata,
} from "@solana/spl-token";
import {
  createInitializeInstruction,
  createUpdateFieldInstruction,
  pack,
} from "@solana/spl-token-metadata";
import axios from "axios";
export default function TokenLaunchpad() {
  const [name, setName] = useState("");
  const [symbol, setSymbol] = useState("");
  const [image, setImage] = useState("");
  const [supply, setSupply] = useState("");
  const wallet = useWallet();
  const { connection } = useConnection();

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "Upload");
    const response = await axios.post(
      "https://api.cloudinary.com/v1_1/dpt2vsygv/image/upload",
      formData
    );
    setImage(response.data.secure_url);
  };
  async function createMint() {
    if (!wallet.publicKey) {
      alert("Connect your wallet first");
      return;
    }
    const mintKeypair = Keypair.generate();

    const metaData = {
      updateAuthority: wallet.publicKey,
      mint: wallet.publicKey,
      name: name,
      symbol: symbol,
      uri: image,
      additionalMetadata: [["description", "Only Possible On Solana"]],
    };
    const metadataExtension = TYPE_SIZE + LENGTH_SIZE;
    const metadataLen = pack(metaData).length;
    const mintLen = getMintLen([ExtensionType.MetadataPointer]);
    const lamports = await connection.getMinimumBalanceForRentExemption(
      mintLen + metadataExtension + metadataLen
    );

    const createAccountInstruction = SystemProgram.createAccount({
      fromPubkey: wallet.publicKey,
      newAccountPubkey: mintKeypair.publicKey,
      space: mintLen,
      lamports,
      programId: TOKEN_2022_PROGRAM_ID,
    });

    const initializeMetadataPointerInstruction =
      createInitializeMetadataPointerInstruction(
        mintKeypair.publicKey,
        wallet.publicKey,
        mintKeypair.publicKey,
        TOKEN_2022_PROGRAM_ID
      );
    const initializeMintInstruction = createInitializeMintInstruction(
      mintKeypair.publicKey,
      9,
      wallet.publicKey,
      wallet.publicKey,
      TOKEN_2022_PROGRAM_ID
    );
    const initializeMetadataInstruction = createInitializeInstruction({
      programId: TOKEN_2022_PROGRAM_ID,
      metadata: mintKeypair.publicKey,
      updateAuthority: wallet.publicKey,
      mint: mintKeypair.publicKey,
      mintAuthority: wallet.publicKey,
      name: name,
      symbol: symbol,
      uri: image,
    });
    const updateFieldInstruction = createUpdateFieldInstruction({
      programId: TOKEN_2022_PROGRAM_ID,
      metadata: mintKeypair.publicKey,
      updateAuthority: wallet.publicKey,
      field: metaData.additionalMetadata[0][0],
      value: metaData.additionalMetadata[0][1],
    });
    const transaction = new Transaction().add(
      createAccountInstruction,
      initializeMetadataPointerInstruction,
      initializeMintInstruction,
      initializeMetadataInstruction,
      updateFieldInstruction
    );

    transaction.feePayer = wallet.publicKey;
    transaction.recentBlockhash = (
      await connection.getLatestBlockhash()
    ).blockhash;
    transaction.partialSign(mintKeypair);

    await wallet.sendTransaction(transaction, connection);

    console.log("Mint created: ", mintKeypair.publicKey.toBase58());
    const associatedToken = getAssociatedTokenAddressSync(
      mintKeypair.publicKey,
      wallet.publicKey,
      false,
      TOKEN_2022_PROGRAM_ID
    );

    console.log(associatedToken.toBase58());

    const transaction2 = new Transaction().add(
      createAssociatedTokenAccountInstruction(
        wallet.publicKey,
        associatedToken,
        wallet.publicKey,
        mintKeypair.publicKey,
        TOKEN_2022_PROGRAM_ID
      )
    );

    await wallet.sendTransaction(transaction2, connection);

    const transaction3 = new Transaction().add(
      createMintToInstruction(
        mintKeypair.publicKey,
        associatedToken,
        wallet.publicKey,
        supply,
        [],
        TOKEN_2022_PROGRAM_ID
      )
    );

    await wallet.sendTransaction(transaction3, connection);
    console.log(`Minted ${supply} tokens to associated account`);

    const metadata = await getTokenMetadata(
      connection,
      mintKeypair.publicKey// Mint Account address
    );
    console.log("\nMetadata:", JSON.stringify(metadata, null, 2));
  }

  return (
    <div className="TokenLaunchpad">
      <h1>Solana Token Launchpad</h1>
      <div className="firstHalf">
        {" "}
        <input
          className="inputText"
          type="text"
          placeholder="Name"
          onChange={(e) => setName(e.target.value)}
        ></input>{" "}
        <input
          className="inputText"
          type="text"
          placeholder="Symbol"
          onChange={(e) => setSymbol(e.target.value)}
        ></input>{" "}
      </div>

      <div className="secondHalf">
        <input
          className="inputText"
          type="text"
          placeholder="Initial Supply"
          onChange={(e) => setSupply(e.target.value)}
        ></input>{" "}
        <input
          className="inputFile"
          type="file"
          onChange={handleUpload}
        ></input>{" "}
      </div>

      <button className="btn" onClick={createMint}>
        Create a token
      </button>
    </div>
  );
}
