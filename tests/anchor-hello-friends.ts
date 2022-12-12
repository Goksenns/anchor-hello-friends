import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { assert } from "chai";
import { AnchorHelloFriends } from "../target/types/anchor_hello_friends";

const { SystemProgram } = anchor.web3;

describe("anchor-hello-friends", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const program = anchor.workspace.AnchorHelloFriends as Program<AnchorHelloFriends>;
  let _hfAccount: anchor.web3.Keypair;

  it("create an account for hello-friends", async () => {
    const hfAccount = anchor.web3.Keypair.generate();
    const hfTxn = await program.rpc.initialize({
      accounts: {
        hfAccount: hfAccount.publicKey,
        user: provider.wallet.publicKey,
        systemProgram: SystemProgram.programId,
      },
      signers: [hfAccount],
    });

    const account = await program.account.hfAccount.fetch(hfAccount.publicKey);

    assert.equal(account.messageCount.toString(), "0");

    _hfAccount = hfAccount;
  });

  it("recevies and saves a message", async () => {
    const message = "hi ladies";
    const user = provider.wallet.publicKey;

    const accountBefore = await program.account.hfAccount.fetch(_hfAccount.publicKey);
    const countBefore = accountBefore.messageCount;

    const txn = await program.rpc.sayHello(message, {
      accounts: {
        hfAccount: _hfAccount.publicKey,
        user,
      },
    });

    const accountAfter = await program.account.hfAccount.fetch(_hfAccount.publicKey);
    const countAfter = accountAfter.messageCount;

    assert.equal(countAfter.sub(countBefore).toString(), "1");

    const messageList = accountAfter.messageList;
    assert.equal(messageList[0].message, message);
    assert.equal(messageList[0].user.equals(user), true);
    assert.equal(messageList[0].timestamp.gt(new anchor.BN(0)), true);
  });
});
