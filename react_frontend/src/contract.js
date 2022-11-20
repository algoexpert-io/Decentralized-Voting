import { ethers } from "ethers";

const address = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
const abi = [
  "event MemberJoined(address indexed member, uint256 joinedAt)",
  "event VoteCreated(address indexed owner, uint256 indexed voteId, uint256 indexed createdAt, uint256 endTime)",
  "event Voted(address indexed voter, uint256 indexed voteId, uint256 indexed option, uint256 createdAt)",
  "function createVote(string uri, uint256 endTime, uint256 options)",
  "function didVote(address member, uint256 voteId) view returns (bool)",
  "function getVote(uint256 voteId) view returns (string, address, uint256[], uint256)",
  "function join()",
  "function vote(uint256 voteId, uint256 option)",
  "function members(address) view returns (bool)",
];

const provider = new ethers.providers.Web3Provider(window.ethereum);

export const connect = async () => {
  await provider.send("eth_requestAccounts", []);
  return getContract();
};

export const getContract = async () => {
  const signer = provider.getSigner();
  const contract = new ethers.Contract(address, abi, signer);
  return { signer: signer, contract: contract };
};
