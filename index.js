import { weth9ABI } from './weth9ABI.js';
import { ethers } from "ethers";
const ETHEREUM = 1;
const POLYGON = 137;
const HARDHAT = 31337;
const BURN_ADDRESS = "0x0000000000000000000000000000000000000000";

class WethMethods {

  constructor(_weth9Address, _weth9ABI, _signer, _dump = true) {
    this.setDump(_dump);
  }

  connect = (_weth9Address, _weth9ABI, _signer) => {
    this.weth9Address = _weth9Address;
    this.weth9ABI = _weth9ABI;
    this.signer = _signer;
    this.provider = this.signer.provider;
    this.signedWeth = new ethers.Contract(_weth9Address, _weth9ABI, _signer);

    this.logLine('-', 80);
    this.dumpLog(`EXECUTING: wethMethods.constructor this.signer.address  = ${this.signer.address}`);
    this.logLine('-', 80);
  };

  connectWeth9DefaultNetwork = (_chainId, _signer) => {
    const { weth9Address, weth9ABI } = this.getWeth9DefaultNetworkABIAddress(_chainId);

    this.weth9Address = weth9Address;
    this.weth9ABI = weth9ABI;
    this.signer = _signer;
    this.provider = this.signer.provider;
    this.signedWeth = new ethers.Contract(weth9Address, weth9ABI, _signer);

    this.logLine('-', 80);
    this.dumpLog(`EXECUTING: wethMethods.constructor this.signer.address  = ${this.signer.address}`);
    this.logLine('-', 80);
  };

  getDeployedWeth9ABI = () => weth9ABI;

  getWeth9NetworkAddress = (chainId) => {
    switch (chainId) {
      case ETHEREUM: return "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
      case POLYGON: return "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619";
      case HARDHAT: return "0x5147c5C1Cb5b5D3f56186C37a4bcFBb3Cd0bD5A7";
      default: return BURN_ADDRESS;
    }
  };

  getWeth9DefaultNetworkABIAddress = (chainId) => {
    const weth9Address = this.getWeth9NetworkAddress(chainId);
    return { weth9Address, weth9ABI };
  };

  setDump = (_dumpMode) => {
    this.dump = _dumpMode;
  };

  initializeDump = async (_address) => {
    if (this.dump) {
      this.beforeEthBalance = await this.ethBalance(_address);
      this.beforeWethBalance = await this.wethBalance(_address);
    }
  };

  finalizeDump = async (_address) => {
    if (this.dump) {
      this.afterEthBalance = await this.ethBalance(_address);
      this.afterWethBalance = await this.wethBalance(_address);

      this.dumpLog(`this.beforeEthBalance          = ${this.beforeEthBalance}`);
      this.dumpLog(`this.beforeWethBalance         = ${this.beforeWethBalance}`);
      this.dumpLog(this.action);
      this.dumpLog(`this.afterEthBalance           = ${this.afterEthBalance}`);
      this.dumpLog(`this.afterWethBalance          = ${this.afterWethBalance}`);
      this.logLine('-', 32);
      this.dumpLog(`this.weiDeductionAmount        = ${this.weiDeductionAmount}`);
      this.dumpLog(`Gas Fee (WEI) Transaction Cost = ${(this.beforeEthBalance - this.afterEthBalance) - this.weiDeductionAmount}`);
      this.dumpLog(`Total (WEI) Transaction Cost   = ${(this.beforeEthBalance - this.afterEthBalance)}`);
      this.logLine();
    }
  };

  logLine = (char = '=', length = 100) => {
    this.dumpLog(char.repeat(length));
  };

  dumpLog = (str) => {
    if (this.dump) console.log(str);
  };

  depositETH = async (_ethAmount) => {
    await this.initializeDump(this.signer.address);

    this.action = `EXECUTING: wethMethods.depositETH(${_ethAmount})`;
    this.weiDeductionAmount = ethers.parseEther(_ethAmount);

    const tx = await this.signedWeth.deposit({ value: this.weiDeductionAmount });

    if (this.dump) {
      this.afterEthBalance = await this.ethBalance(this.signer.address);
      this.afterWethBalance = await this.wethBalance(this.signer.address);
    }

    await this.finalizeDump(this.signer.address);
    return tx;
  };

  depositWEI = async (_weiAmount) => {
    await this.initializeDump(this.signer.address);

    this.weiDeductionAmount = _weiAmount;
    this.action = `EXECUTING: wethMethods.depositWEI(${_weiAmount})`;

    const tx = await this.signedWeth.deposit({ value: _weiAmount });

    await this.finalizeDump(this.signer.address);
    return tx;
  };

  withdrawETH = async (_ethAmount) => {
    await this.initializeDump(this.signer.address);

    const weiAmount = ethers.parseEther(_ethAmount);
    this.weiDeductionAmount = -weiAmount;
    this.action = `EXECUTING: wethMethods.withdrawETH(${_ethAmount})`;

    const tx = await this.signedWeth.withdraw(weiAmount);

    await this.finalizeDump(this.signer.address);
    return tx;
  };

  withdrawWEI = async (_weiAmount) => {
    await this.initializeDump(this.signer.address);

    this.weiDeductionAmount = _weiAmount;
    this.action = `EXECUTING: wethMethods.withdrawWEI(${_weiAmount})`;

    const tx = await this.signedWeth.withdraw(_weiAmount);

    await this.finalizeDump(this.signer.address);
    return tx;
  };

  ethBalance = async (_address) => {
    const ethBalance = await this.provider.getBalance(_address);
    return ethBalance;
  };

  wethBalance = async (_address) => {
    const wethBalance = await this.signedWeth.balanceOf(_address);
    return wethBalance;
  }
}

export {
  WethMethods,
  ETHEREUM,
  POLYGON,
  HARDHAT,
  BURN_ADDRESS
};
