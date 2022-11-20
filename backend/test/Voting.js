const { expect } = require("chai");

const getTime = async () => {
  const blockNumBefore = await ethers.provider.getBlockNumber();
  const blockBefore = await ethers.provider.getBlock(blockNumBefore);
  return blockBefore.timestamp;
};

describe("Voting", function () {
  let addr0;
  let addr1;
  let voting;

  before(async () => {
    [addr0, addr1] = await ethers.getSigners();

    const Voting = await ethers.getContractFactory("Voting");
    voting = await Voting.deploy({});
  });

  describe("Join", () => {
    it("Can join", async () => {
      await expect(voting.join()).to.emit(voting, "MemberJoined");
    });
    it("Cannot join if already member", async () => {
      await expect(voting.join()).to.be.reverted;
    });
  });

  describe("Create vote", () => {
    it("Cannot create vote if not member", async () => {
      await expect(
        voting.connect(addr1).createVote("", (await getTime()) + 60, 4)
      ).to.be.reverted;
    });
    it("Cannot create vote invalid end time", async () => {
      await expect(voting.createVote("", (await getTime()) - 60, 4)).to.be
        .reverted;
    });
    it("Cannot create vote it too few options", async () => {
      await expect(voting.createVote("", (await getTime()) + 60, 1)).to.be
        .reverted;
    });
    it("Cannot create vote if too many options", async () => {
      await expect(voting.createVote("", (await getTime()) + 60, 9)).to.be
        .reverted;
    });
    it("Can create vote", async () => {
      await expect(voting.createVote("1", (await getTime()) + 60, 3)).to.emit(
        voting,
        "VoteCreated"
      );
    });
    it("Can create 2nd vote", async () => {
      await expect(voting.createVote("2", (await getTime()) + 60, 4)).to.emit(
        voting,
        "VoteCreated"
      );
    });
  });

  describe("Vote", () => {
    it("Cannot vote if not member", async () => {
      await expect(voting.connect(addr1).vote(0, 0)).to.be.reverted;
    });
    it("Cannot vote on vote that doesn't exist", async () => {
      await expect(voting.vote(2, 0)).to.be.reverted;
    });
    it("Cannot vote on invalid option", async () => {
      await expect(voting.vote(0, 9)).to.be.reverted;
    });
    it("Can vote", async () => {
      await expect(voting.vote(0, 0)).to.emit(voting, "Voted");
    });
    it("Cannot vote twice", async () => {
      await expect(voting.vote(0, 1)).to.be.reverted;
    });
    it("Cannot vote on expired vote", async () => {
      await voting.connect(addr1).join();
      await ethers.provider.send("evm_mine", [(await getTime()) + 3600]);
      await expect(voting.connect(addr1).vote(0, 0)).to.be.reverted;
    });
  });
});
