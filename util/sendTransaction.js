// /home/dev/www/service/pumpfun_3888/util/sendTransaction.js
const Web3 = require("web3");
const crypto = require('crypto');
const bip39 = require('bip39'); // 시드 생성용 라이브러리
require("dotenv").config(); // Ensure dotenv is configured early

const {
    executeQuery,
    getCurrentTimestamp,
} = require("./co_util");

// Web3 초기화 및 연결 확인
let web3;
// Only initialize Web3 if RPC is enabled
if (process.env.G_RPC !== 'N') {
    try {
        web3 = new Web3(process.env.AAH_RPC_URL);
        console.log("Web3 connected to sendTransaction.js:", process.env.AAH_RPC_URL);
    } catch (error) {
        console.error("Failed to initialize Web3:", error.message);
        // If Web3 fails to initialize even when enabled, it's a critical error
        process.exit(1);
    }
} else {
    console.log("G_RPC is 'N'. Skipping Web3 initialization.");
    // Create a mock web3 object or handle functions accordingly
    // For simplicity, we'll add checks within each function
}


// 상수 정의
const FEE_ADDRESS = process.env.AAH_BANK_RECV_ADDRESS;
const FACTORY_ADDRESS = process.env.AAH_CONTRACT_ADDRESS;
const ABI = require('../abi/abi.json');
const TOKEN_ABI = require('../abi/token.json');
const FUNDING_GOAL = 24000;
const MAX_SUPPLY = parseInt(800000);
const GAS_LIMIT = 8000000;
const GAS_LIMIT_APPROVE = 100000;
const GAS_LIMIT_COIN = 2100000;

// --- Helper function to check RPC status ---
function isRpcDisabled() {
    const disabled = process.env.G_RPC === 'N';
    if (disabled) {
        // console.warn("RPC interaction skipped because G_RPC=N");
    }
    // Also check if web3 was initialized
    if (!web3 && !disabled) {
         console.error("Web3 is not initialized, but G_RPC is not 'N'. Check RPC URL and connection.");
         // Throw an error or handle as appropriate for your application logic
         throw new Error("Web3 not initialized. Cannot perform RPC action.");
    }
    return disabled || !web3; // Consider RPC disabled if G_RPC=N OR web3 failed init
}

/**
 * 현재 블록 번호 가져오기
 * @returns {Promise<number>} 현재 블록 번호
 * @throws {Error} 블록 번호 가져오기 실패 시 에러 발생
 */
async function getCurrentBlockNumber() {
    if (isRpcDisabled()) return 0; // Return default value
    try {
        return await web3.eth.getBlockNumber();
    } catch (error) {
        console.error('Error fetching block number:', error.message);
        throw new Error("Failed to connect to the RPC endpoint");
    }
}

/**
 * 전체 밈 토큰 조회
 * @returns {Promise<Array>} 밈 토큰 정보 배열
 * @throws {Error} 밈 토큰 조회 실패 시 에러 발생
 */
async function getAllMemeTokens() {
    if (isRpcDisabled()) return []; // Return default empty array
    try {
        const contract = new web3.eth.Contract(ABI, FACTORY_ADDRESS);
        const memeTokens = await contract.methods.getAllMemeTokens().call();
        return memeTokens.map(token => ({
            name: token.name || '',
            symbol: token.symbol || '',
            description: token.description || '',
            telegram: token.telegram || '',
            website: token.website || '',
            tokenImageUrl: token.tokenImageUrl || '',
            fundingRaised: web3.utils.fromWei(token.fundingRaised || '0', 'ether'),
            tokenAddress: token.tokenAddress || '',
            creatorAddress: token.creatorAddress || '',
        }));
    } catch (error) {
        console.error('Error fetching meme tokens:', error.message, error.stack);
        // Keep existing error handling for when RPC is enabled but fails
        if (error.message.includes("CONNECTION ERROR") || error.message.includes("Failed to connect") || error.message.includes("Invalid JSON RPC response")) {
            throw new Error("AAH 블록체인 네트워크 연결에 실패했습니다. 잠시 후 다시 시도해주세요.");
        } else if (error.message.includes("Token details not found")) {
            throw new Error("토큰 정보를 찾을 수 없습니다.");
        } else {
            throw new Error("밈 토큰 목록을 불러오는 데 실패했습니다. 잠시 후 다시 시도해주세요.");
        }
    }
}

/**
 * 밈 토큰 상세 정보 조회
 * @param {string} tokenAddress - 토큰 주소
 * @returns {Promise<Object>} 밈 토큰 상세 정보
 * @throws {Error} 토큰 상세 정보 조회 실패 시 에러 발생
 */
async function getMemeTokenDetails(tokenAddress) {
    // Basic validation first
    if (!tokenAddress) throw new Error('Invalid tokenAddress');
    // No need to check isAddressValid if RPC is disabled
    if (!isRpcDisabled() && !await isAddressValid(tokenAddress)) {
        throw new Error('Invalid tokenAddress');
    }
    if (isRpcDisabled()) {
        // Return a default structure or throw specific error
        return {
            name: 'N/A (RPC Disabled)', symbol: '', description: '', telegram: '',
            website: '', tokenImageUrl: '', fundingRaised: '0',
            tokenAddress: tokenAddress, creatorAddress: ''
        };
    }
    try {
        const contract = new web3.eth.Contract(ABI, FACTORY_ADDRESS);
        const tokenDetail = await contract.methods.getMemeTokenDetails(tokenAddress).call();
        if (!tokenDetail || Object.keys(tokenDetail).length === 0) {
            throw new Error('Token details not found');
        }
        return {
            name: tokenDetail.name || '',
            symbol: tokenDetail.symbol || '',
            description: tokenDetail.description || '',
            telegram: tokenDetail.telegram || '',
            website: tokenDetail.website || '',
            tokenImageUrl: tokenDetail.tokenImageUrl || '',
            fundingRaised: web3.utils.fromWei(tokenDetail.fundingRaised || '0', 'ether'),
            tokenAddress: tokenDetail.tokenAddress || '',
            creatorAddress: tokenDetail.creatorAddress || '',
        };
    } catch (error) {
        console.error('Error fetching meme token details:', error.message, error.stack);
        // Keep existing error handling
        if (error.message.includes("CONNECTION ERROR") || error.message.includes("Failed to connect")) {
            throw new Error("Failed to connect to the RPC endpoint");
        }
        throw error; // Re-throw other errors
    }
}

/**
 * 토큰 상세 정보 (owners, transfers 포함) 조회
 * @param {string} tokenAddress - 토큰 주소
 * @returns {Promise<Object>} 토큰 상세 정보
 * @throws {Error} 토큰 상세 정보 조회 실패 시 에러 발생
 */
async function getTokenDetail(tokenAddress) {
    if (isRpcDisabled()) {
        return {
            owners: [], transfers: [], fundingRaised: '0', fundingGoal: FUNDING_GOAL.toString(),
            remainingTokens: MAX_SUPPLY, totalSupply: 0
        };
    }
    try {
        const factoryContract = new web3.eth.Contract(ABI, FACTORY_ADDRESS);
        const tokenContract = new web3.eth.Contract(TOKEN_ABI, tokenAddress);
        const tokenDetail = await factoryContract.methods.getTokenDetails(tokenAddress).call();
        const totalSupplyResponse = await tokenContract.methods.totalSupply().call();
        const totalSupplyToken = web3.utils.fromWei(totalSupplyResponse, 'ether');
        const totalSupplyFormatted = parseInt(totalSupplyToken) - 200000;
        const remainingTokens = MAX_SUPPLY - totalSupplyFormatted;

        const { owners, transfers } = await getOwnersAndTransfers(tokenContract, totalSupplyResponse);
        return {
            owners,
            transfers,
            fundingRaised: web3.utils.fromWei(tokenDetail.fundingRaised, 'ether') || 0,
            fundingGoal: web3.utils.fromWei(tokenDetail.fundingGoal, 'ether') || FUNDING_GOAL,
            remainingTokens,
            totalSupply: totalSupplyFormatted,
        };
    } catch (error) {
        console.error('Error fetching token details:', error.message, error.stack);
        if (error.message.includes("CONNECTION ERROR") || error.message.includes("Failed to connect")) {
            throw new Error("Failed to connect to the RPC endpoint");
        }
        throw error;
    }
}

/**
 * 토큰 소유자 및 전송 내역 조회
 * @param {Object} contract - 토큰 컨트랙트 객체
 * @param {string} maxSupply - 최대 공급량
 * @returns {Promise<Object>} 토큰 소유자 및 전송 내역
 * @throws {Error} 토큰 소유자 및 전송 내역 조회 실패 시 에러 발생
 */
async function getOwnersAndTransfers(contract, maxSupply) {
    // This function is called by getTokenDetail, which already checks isRpcDisabled
    // If called directly, add: if (isRpcDisabled()) return { owners: [], transfers: [] };
    const deployBlock = 6140605; // 컨트랙트 배포 블록 번호
    const currentBlock = await getCurrentBlockNumber(); // Will return 0 if RPC disabled

    try {
        // If currentBlock is 0 (or less than deployBlock), skip fetching events
        if (currentBlock < deployBlock) {
             console.log("Current block is before deploy block (or RPC disabled), skipping event fetch.");
             return { owners: [], transfers: [] };
        }

        const transferEvents = await contract.getPastEvents('Transfer', {
            fromBlock: deployBlock,
            toBlock: currentBlock,
        });

        // ... (rest of the logic remains the same)
        if (transferEvents.length === 0) {
            console.log("No Transfer events found.");
        }

        if (BigInt(maxSupply) === 0n) {
            // Allow zero maxSupply if RPC is disabled, otherwise throw error
            if (!isRpcDisabled()) {
                throw new Error("maxSupply cannot be zero. Please check the contract's total supply.");
            } else {
                 console.warn("maxSupply is zero, returning empty owners/transfers (RPC Disabled).");
                 return { owners: [], transfers: [] };
            }
        }
        // ... (rest of the logic for calculating owners/transfers)

        const ownersMap = {};
        transferEvents.forEach(event => {
            const to = event.returnValues.to;
            const value = BigInt(event.returnValues.value);
            if (!ownersMap[to]) {
                ownersMap[to] = 0n;
            }
            ownersMap[to] += value;
        });

        const owners = Object.entries(ownersMap).map(([address, value]) => ({
            owner_address: address,
            percentage_relative_to_total_supply: ((value * 100n) / BigInt(maxSupply)).toString(),
        }));

        const transfers = transferEvents.map(event => ({
            from_address: event.returnValues.from,
            to_address: event.returnValues.to,
            value_decimal: web3.utils.fromWei(event.returnValues.value, 'ether'),
            transaction_hash: event.transactionHash,
        }));

        return { owners, transfers };

    } catch (error) {
        console.error("Error fetching Transfer events:", error.message, error.stack);
        if (error.message.includes("CONNECTION ERROR") || error.message.includes("Failed to connect")) {
            throw new Error("Failed to connect to the RPC endpoint");
        }
        throw error;
    }
}

// --- Transaction Functions ---
// For functions that SEND transactions, it's better to throw an error if RPC is disabled.

/**
 * 밈 토큰 구매
 * @param {string} user_addr - 사용자 주소
 * @param {string} tokenAddress - 토큰 주소
 * @param {number} tokenQty - 구매할 토큰 수량
 * @param {string} cost - 구매 비용
 * @returns {Promise<Object>} 트랜잭션 결과
 * @throws {Error} 토큰 구매 실패 시 에러 발생
 */
async function set_buyMemeToken(user_addr, tokenAddress, tokenQty, cost) {
    if (isRpcDisabled()) throw new Error("RPC is disabled (G_RPC=N), cannot buy token.");
    try {
        const factoryContract = new web3.eth.Contract(ABI, FACTORY_ADDRESS);
        const requiredEth = web3.utils.toWei(cost, 'ether');
        if (!await fn_unlockAccount(user_addr)) { // fn_unlockAccount will also check G_RPC
            throw new Error("Failed to unlock account.");
        }
        // Ensure gas estimation or sending doesn't happen if unlock failed due to RPC disable
        if (isRpcDisabled()) throw new Error("RPC is disabled (G_RPC=N), cannot buy token.");

        return await factoryContract.methods.buyMemeToken(tokenAddress, tokenQty)
            .send({ from: user_addr, value: requiredEth });
    } catch (error) {
        console.error('[sendTransaction.js - set_buyMemeToken] Error result:', error.message, error.stack);
        if (error.message.includes("RPC is disabled")) throw error; // Re-throw specific error
        if (error.message.includes("CONNECTION ERROR") || error.message.includes("Failed to connect")) {
            throw new Error("Failed to connect to the RPC endpoint");
        }
        throw error; // Re-throw other errors
    }
}

/**
 * 밈 토큰 판매
 * @param {string} user_addr - 사용자 주소
 * @param {string} tokenAddress - 토큰 주소
 * @param {number} tokenQty - 판매할 토큰 수량
 * @param {string} cost - 판매 비용 (Note: cost seems unused here, maybe remove?)
 * @returns {Promise<Object>} 트랜잭션 결과
 * @throws {Error} 토큰 판매 실패 시 에러 발생
 */
async function set_sellMemeToken(user_addr, tokenAddress, tokenQty, cost) {
    if (isRpcDisabled()) throw new Error("RPC is disabled (G_RPC=N), cannot sell token.");
    try {
        const factoryContract = new web3.eth.Contract(ABI, FACTORY_ADDRESS);
        const tokenContract = new web3.eth.Contract(TOKEN_ABI, tokenAddress);

        // Check balance, supply, allowance etc. - these will fail gracefully if RPC disabled
        const userBalance = await tokenContract.methods.balanceOf(user_addr).call();
        const userBalanceEther = web3.utils.fromWei(userBalance, 'ether');
        if (userBalanceEther < tokenQty) {
            throw new Error("Insufficient token balance.");
        }

        const totalSupplyResponse = await tokenContract.methods.totalSupply().call();
        const totalSupplyToken = web3.utils.fromWei(totalSupplyResponse, 'ether');
        const currentSupplyScaled = (totalSupplyToken - 200000);

        // calculateCost might fail if RPC disabled, handle appropriately if needed, but estimateGas will fail anyway
        // const refundEth = await factoryContract.methods.calculateCost(currentSupplyScaled, tokenQty).call();

        const allowance = await tokenContract.methods.allowance(user_addr, FACTORY_ADDRESS).call();
        // Convert allowance and tokenQty to comparable units (e.g., Wei or BigNumber) if necessary
        // Assuming tokenQty is in Ether unit string/number, convert allowance from Wei
        const allowanceEther = web3.utils.fromWei(allowance, 'ether');
        if (new BigNumber(allowanceEther).lt(new BigNumber(tokenQty))) { // Use BigNumber for comparison
             throw new Error("Insufficient allowance for the contract. Please approve the tokens first.");
        }

        // Estimate gas - this requires RPC
        const gasEstimate = await factoryContract.methods.sellMemeToken(tokenAddress, tokenQty).estimateGas({ from: user_addr });

        // Sign and send - requires private key and RPC
        const privateKey = await fn_getPrivateKey(user_addr); // Reads from DB, OK
        if (!privateKey) throw new Error("Could not retrieve private key.");

        const signedTx = await web3.eth.accounts.signTransaction(
            {
                to: FACTORY_ADDRESS,
                data: factoryContract.methods.sellMemeToken(tokenAddress, tokenQty).encodeABI(),
                gas: gasEstimate,
                from: user_addr, // Added for clarity, though signTransaction infers it
            },
            privateKey // Use the fetched private key
        );

        return await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
    } catch (error) {
        console.error(`Error in set_sellMemeToken: ${error.message}`);
        if (error.message.includes("RPC is disabled")) throw error;
        if (error.message.includes("CONNECTION ERROR") || error.message.includes("Failed to connect")) {
            throw new Error("Failed to connect to the RPC endpoint");
        }
        throw error; // Re-throw other errors
    }
}

/**
 * 토큰 사용 승인
 * @param {string} user_addr - 사용자 주소
 * @param {string} tokenAddress - 토큰 주소
 * @param {number} tokenQty - 승인할 토큰 수량 (Should be string or BigNumber in Wei for consistency)
 * @returns {Promise<Object>} 트랜잭션 결과
 * @throws {Error} 토큰 사용 승인 실패 시 에러 발생
 */
async function set_approveToken(user_addr, tokenAddress, tokenQty) {
    if (isRpcDisabled()) throw new Error("RPC is disabled (G_RPC=N), cannot approve token.");
    try {
        const tokenContract = new web3.eth.Contract(TOKEN_ABI, tokenAddress);
        const privateKey = await fn_getPrivateKey(user_addr); // Reads from DB, OK
        if (!privateKey) throw new Error("Could not retrieve private key.");

        // Convert tokenQty to Wei if it's in Ether unit
        const amountInWei = web3.utils.toWei(tokenQty.toString(), 'ether');

        // Estimate gas (optional but recommended)
        // const gasEstimate = await tokenContract.methods.approve(FACTORY_ADDRESS, amountInWei).estimateGas({ from: user_addr });

        const signedTx = await web3.eth.accounts.signTransaction(
            {
                to: tokenAddress,
                data: tokenContract.methods.approve(FACTORY_ADDRESS, amountInWei).encodeABI(), // Use Wei amount
                gas: GAS_LIMIT_APPROVE, // Use constant or estimated gas
                from: user_addr, // Added for clarity
            },
            privateKey // Use fetched private key
        );
        return await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
    } catch (error) {
        console.error(`Error in approveToken: ${error.message}`);
        if (error.message.includes("RPC is disabled")) throw error;
        if (error.message.includes("CONNECTION ERROR") || error.message.includes("Failed to connect")) {
            throw new Error("Failed to connect to the RPC endpoint");
        }
        throw error;
    }
}

/**
 * 토큰 비용 계산
 * @param {number} totalSupply - 총 공급량
 * @param {number} purchaseAmount - 구매 수량
 * @returns {Promise<string>} 계산된 비용
 * @throws {Error} 토큰 비용 계산 실패 시 에러 발생
 */
async function get_calculateCost(totalSupply, purchaseAmount) {
    if (isRpcDisabled()) return '0'; // Return default or throw error
    try {
        const factoryContract = new web3.eth.Contract(ABI, FACTORY_ADDRESS);
        // Ensure amounts are in correct format (e.g., string or number expected by contract)
        const cost_WEI = await factoryContract.methods.calculateCost(totalSupply.toString(), purchaseAmount.toString()).call();
        return web3.utils.fromWei(cost_WEI, 'ether');
    } catch (error) {
        console.error('Error calculating cost:', error.message, error.stack);
        if (error.message.includes("CONNECTION ERROR") || error.message.includes("Failed to connect")) {
            throw new Error("Failed to connect to the RPC endpoint");
        }
        throw error;
    }
}

/**
 * 밈 토큰 생성
 * @param {string} token_name - 토큰 이름
 * @param {string} symbol - 토큰 심볼
 * @param {string} description - 토큰 설명
 * @param {string} telegram - 텔레그램 링크
 * @param {string} website - 웹사이트 링크
 * @param {string} image - 이미지 URL
 * @param {string} user_addr - 사용자 주소
 * @param {string} aahDeposit - AAH 예치금
 * @param {string} email - 사용자 이메일
 * @returns {Promise<string|null>} 생성된 토큰 주소 또는 null
 * @throws {Error} 토큰 생성 실패 시 에러 발생
 */
async function createMemeToken(token_name, symbol, description, telegram, website, image, user_addr, aahDeposit = "10", email = '') {
    if (isRpcDisabled()) throw new Error("RPC is disabled (G_RPC=N), cannot create token.");
    try {
        const contract = new web3.eth.Contract(ABI, FACTORY_ADDRESS);
        if (!await fn_unlockAccount(user_addr)) { // fn_unlockAccount checks G_RPC
            throw new Error("Account unlock failed");
        }
        // Ensure sending doesn't happen if unlock failed due to RPC disable
        if (isRpcDisabled()) throw new Error("RPC is disabled (G_RPC=N), cannot create token.");

        const receipt = await contract.methods.createMemeToken(token_name, symbol, image, description, telegram, website)
            .send({
                from: user_addr,
                value: web3.utils.toWei(aahDeposit, 'ether'),
                gas: GAS_LIMIT
            });

        // Check for event data robustly
        const tokenCreatedEvent = receipt.events?.TokenCreated || receipt.events?.['0']; // Adjust based on actual event name/index
        if (!tokenCreatedEvent || !tokenCreatedEvent.address) { // Check if address exists in the event
             console.error("Failed to retrieve token address from event:", receipt.events);
             throw new Error("Failed to retrieve token address from creation event");
        }
        const memeTokenAddress = tokenCreatedEvent.address;
        console.log("Token creation successful, address:", memeTokenAddress);
        return memeTokenAddress;

    } catch (error) {
        console.error("Token Transaction failed:", error);
        // Log failure to DB regardless of RPC status if attempted
        try {
            await executeQuery(`INSERT INTO transaction_logs (sender_Address, recipient_Address, email, amount, token_Address, status) VALUES (?, ?, ?, ?, ?, ?)`,
                [user_addr, FEE_ADDRESS, email, aahDeposit, FACTORY_ADDRESS, "failed"]);
        } catch (dbError) {
            console.error("Failed to log transaction:", dbError);
        }
        // Re-throw appropriate error
        if (error.message.includes("RPC is disabled")) throw error;
        if (error.message.includes("CONNECTION ERROR") || error.message.includes("Failed to connect")) {
            throw new Error("Failed to connect to the RPC endpoint");
        }
        throw error; // Re-throw other errors
    }
}

/**
 * 계정 잠금 해제
 * @param {string} addr - 계정 주소
 * @returns {Promise<boolean>} 잠금 해제 성공 여부
 * @throws {Error} 계정 잠금 해제 실패 시 에러 발생
 */
async function fn_unlockAccount(addr) {
    // This interacts with the node's personal API, might fail if node is down, not just RPC endpoint
    if (isRpcDisabled()) return false; // Cannot unlock if node connection is disabled/unavailable
    try {
        // Added await here
        const unlocked = await web3.eth.personal.unlockAccount(addr, process.env.AAH_ADDR_PWD, 500);
        return unlocked; // Should be true if successful
    } catch (e) {
        console.error("Error unlocking account:", e.message);
        // Check if the error is due to connection issues
        if (e.message.includes("CONNECTION ERROR") || e.message.includes("Failed to connect")) {
             console.warn("Could not unlock account due to connection error.");
             // Optionally throw a specific error or just return false
        }
        return false;
    }
}

/**
 * 개인 키 가져오기 (DB Operation - No RPC Check Needed)
 * @param {string} user_address - 사용자 주소
 * @returns {Promise<string>} 복호화된 개인 키
 * @throws {Error} 지갑 정보 가져오기 실패 시 에러 발생
 */
async function fn_getPrivateKey(user_address) {
    try {
        const rows = await executeQuery(`SELECT pub_key, seed, pri_key FROM aahWallet WHERE pub_key = ?`, [user_address]);
        if (rows.length === 0) throw new Error('Wallet not found');
        const { pri_key } = rows[0];
        // Decryption logic might throw error if pri_key is malformed
        return await fn_decrypt_db(pri_key); // Assuming fn_decrypt_db handles JSON parsing errors
    } catch (error) {
        console.error('Failed to get wallet:', error);
        // Do not throw RPC connection error here, it's a DB/decryption issue
        throw new Error("Failed to retrieve or decrypt private key from database.");
    }
}

/**
 * 개인 키 가져오기 (Imports key to node - Requires Node Connection)
 * @param {string} pri_addr - 개인키
 * @returns {Promise<string>} 복호화된 개인 키
 * @throws {Error} 지갑 정보 가져오기 실패 시 에러 발생
 */
async function fn_importRawKey(pri_addr) {
    if (isRpcDisabled()) return null; // Cannot import if node connection is disabled/unavailable
    try {
        const pri_addr_formatted = pri_addr.startsWith("0x") ? pri_addr : "0x" + pri_addr; // Ensure 0x prefix
        // Added await here
        const importedAddress = await web3.eth.personal.importRawKey(pri_addr_formatted, process.env.AAH_ADDR_PWD);
        return importedAddress; // Returns the address of the imported key
    } catch (error) {
        console.error('Failed to importRawKey:', error);
        if (error.message.includes("CONNECTION ERROR") || error.message.includes("Failed to connect")) {
            throw new Error("Failed to connect to the RPC endpoint for importing key");
        }
        throw error; // Re-throw other errors
    }
}

/**
 * 새 지갑 생성 및 데이터베이스 저장
 * @param {string} email - 사용자 이메일 (선택 사항)
 * @param {string} game - 게임 정보 (선택 사항)
 * @returns {Promise<Object>} 생성된 지갑 정보 (공개키, 암호화된 시드, 개인 키 포함)
 * @throws {Error} 지갑 생성 실패 시 에러 발생
 */
async function fn_generateWallet(email = null, game = null) {
    // Wallet generation itself is local
    const seed = bip39.generateMnemonic();
    // Use web3.eth.accounts.create() for local creation without needing a node connection
    const account = web3.eth.accounts.create(web3.utils.randomHex(32)); // Create with random entropy
    // Or derive from mnemonic if needed, also local:
    // const hdwallet = require('ethereumjs-wallet').hdkey.fromMasterSeed(await bip39.mnemonicToSeed(seed));
    // const wallet = hdwallet.derivePath("m/44'/60'/0'/0/0").getWallet();
    // const account = { address: '0x' + wallet.getAddress().toString('hex'), privateKey: '0x' + wallet.getPrivateKey().toString('hex') };

    const encryptedSeed = fn_encrypt(seed); // Local encryption
    const encryptedPrivateKey = fn_encrypt(account.privateKey); // Local encryption

    try {
        // DB insert is local
        await executeQuery(`INSERT INTO aahWallet (pub_key, seed, pri_key, email, game) VALUES (?, ?, ?, ?, ?)`,
            [account.address, JSON.stringify(encryptedSeed), JSON.stringify(encryptedPrivateKey), email, game] // Store JSON string
        );

        // Import key to node - requires connection, check G_RPC
        if (!isRpcDisabled()) {
            try {
                 await fn_importRawKey(account.privateKey); // fn_importRawKey checks G_RPC
                 console.log(`Wallet key imported to node for address: ${account.address}`);
            } catch (importError) {
                 console.warn(`Failed to import generated key to node: ${importError.message}`);
                 // Decide if this is critical. Maybe just log a warning.
            }
        } else {
             console.log(`Skipped importing generated key to node for ${account.address} (G_RPC=N)`);
        }

        return {
            pub_key: account.address,
            // Return the stringified JSON for consistency or the objects? Let's return objects.
            encryptedSeed: encryptedSeed,
            encryptedPrivateKey: encryptedPrivateKey,
        };
    } catch (error) {
        console.error('Wallet generation or DB storage failed:', error);
        // Distinguish between DB error and import error if needed
        throw new Error("Failed to generate wallet or store it in database.");
    }
}

/**
 * 기존 지갑 복호화 및 반환 (DB Operation - No RPC Check Needed)
 * @param {string} pub_key - 공개키 (지갑 주소)
 * @returns {Object} 복호화된 지갑 정보
 */
async function fn_getWallet(user_address) {
    try {
        const rows = await executeQuery(`SELECT pub_key, seed, pri_key FROM aahWallet WHERE pub_key = ?`, [user_address]);
        if (rows.length === 0) throw new Error('Wallet not found');
        const { pub_key, seed, pri_key } = rows[0];
        // Assuming fn_decrypt_db expects the JSON string from the DB
        return {
            pub_key,
            seed: await fn_decrypt_db(seed), // Decrypt seed
            pri_key: await fn_decrypt_db(pri_key), // Decrypt private key
        };
    } catch (error) {
        console.error('Failed to get wallet:', error);
        throw new Error("Failed to retrieve or decrypt wallet from database.");
    }
}

/**
 * 네이티브 코인 전송 함수
 * @param {string} from - 송신자 주소
 * @param {string} to - 수신자 주소
 * @param {number} amount - 전송할 코인 양 (단위: ETH, BNB 등)
 * @param {string} privateKey - 송신자의 개인 키
 */
async function sendTransactionCoin({ from, to, amount, privateKey, email = '' }) {
    if (isRpcDisabled()) throw new Error("RPC is disabled (G_RPC=N), cannot send coin.");
    try {
        const nonce = await web3.eth.getTransactionCount(from, "latest");
        const tx = {
            from,
            to,
            value: web3.utils.toWei(amount.toString(), "ether"),
            nonce,
            gas: GAS_LIMIT_COIN,
            // Consider adding gasPrice or maxPriorityFeePerGas/maxFeePerGas for EIP-1559
        };
        const signedTx = await web3.eth.accounts.signTransaction(tx, privateKey);
        const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
        // Log success to DB
        await executeQuery(`INSERT INTO transaction_logs (sender_Address, recipient_Address, email, amount, transaction_hash, status) VALUES (?, ?, ?, ?, ?, ?)`,
            [from, to, email, amount, receipt.transactionHash, "success"]
        );
        return receipt;
    } catch (error) {
        console.error("Coin Transaction failed:", error);
        // Log failure to DB
        await executeQuery(`INSERT INTO transaction_logs (sender_Address, recipient_Address, email, amount, status) VALUES (?, ?, ?, ?, ?)`,
            [from, to, email, amount, "failed"]
        );
        if (error.message.includes("RPC is disabled")) throw error;
        if (error.message.includes("CONNECTION ERROR") || error.message.includes("Failed to connect")) {
            throw new Error("Failed to connect to the RPC endpoint");
        }
        throw error;
    }
}

/**
 * 토큰 전송 함수
 * @param {string} from - 송신자 주소
 * @param {string} to - 수신자 주소
 * @param {number} amount - 전송할 토큰 양 (Should be string/BigNumber in Ether unit)
 * @param {string} privateKey - 송신자의 개인 키
 * @param {string} tokenAddress - 전송할 토큰의 컨트랙트 주소
 */
async function sendTransactionToken({ from, to, amount, privateKey, tokenAddress, email = '' }) {
    if (isRpcDisabled()) throw new Error("RPC is disabled (G_RPC=N), cannot send token.");
    try {
        const nonce = await web3.eth.getTransactionCount(from, "latest");
        // Use the specific Token ABI for transfer
        const contract = new web3.eth.Contract(TOKEN_ABI, tokenAddress);
        const amountInWei = web3.utils.toWei(amount.toString(), "ether");
        const data = contract.methods.transfer(to, amountInWei).encodeABI();
        const tx = {
            from,
            to: tokenAddress, // Target is the token contract address
            nonce,
            gas: GAS_LIMIT_APPROVE, // Use appropriate gas limit for token transfer
            data,
            // Consider adding gasPrice or EIP-1559 fields
        };
        const signedTx = await web3.eth.accounts.signTransaction(tx, privateKey);
        const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
        // Log success to DB
        await executeQuery(`INSERT INTO transaction_logs (sender_Address, recipient_Address, email, amount, token_Address, transaction_hash, status) VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [from, to, email, amount, tokenAddress, receipt.transactionHash, "success"]
        );
        return receipt;
    } catch (error) {
        console.error("Token Transaction failed:", error);
        // Log failure to DB
        await executeQuery(`INSERT INTO transaction_logs (sender_Address, recipient_Address, email, amount, token_Address, status) VALUES (?, ?, ?, ?, ?, ?)`,
            [from, to, email, amount, tokenAddress, "failed"]
        );
        if (error.message.includes("RPC is disabled")) throw error;
        if (error.message.includes("CONNECTION ERROR") || error.message.includes("Failed to connect")) {
            throw new Error("Failed to connect to the RPC endpoint");
        }
        throw error;
    }
}


// 데이터 암호화 및 복호화 함수 (Local - No RPC Check Needed)
function fn_encrypt(data) {
    const SALT_KEY = process.env.SALT_KEY;
    const IV = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(SALT_KEY, 'hex'), IV);
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return {
        iv: IV.toString('hex'),
        encryptedData: encrypted
    };
}

// 데이터 복호화 함수
function fn_decrypt(encryptedData, iv) {
    if (!encryptedData || !iv) {
        throw new Error('fn_decrypt error - Invalid arguments: Both encryptedData and iv are required');
    }
    const SALT_KEY = process.env.SALT_KEY;
    const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(SALT_KEY, 'hex'), Buffer.from(iv, 'hex'));
    let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}

// 데이터베이스 저장 JSON 문자열의 복호화 함수 (Local - No RPC Check Needed)
async function fn_decrypt_db(encryptedData) {
    if (!encryptedData) {
        // Return null or empty string instead of throwing? Depends on usage.
        console.error('fn_decrypt_db error - Invalid argument: encryptedData is required');
        return null; // Or throw new Error(...)
    }
    try {
        // Ensure encryptedData is a string before parsing
        if (typeof encryptedData !== 'string') {
             throw new Error('fn_decrypt_db error - encryptedData must be a JSON string');
        }
        const parsedData = JSON.parse(encryptedData);
        // Check if parsedData has the expected structure
        if (!parsedData || typeof parsedData.iv !== 'string' || typeof parsedData.encryptedData !== 'string') {
             throw new Error('fn_decrypt_db error - Invalid JSON structure in input');
        }
        const { iv, encryptedData: data } = parsedData;

        const SALT_KEY = process.env.SALT_KEY;
        if (!SALT_KEY) throw new Error("SALT_KEY environment variable is not set.");

        const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(SALT_KEY, 'hex'), Buffer.from(iv, 'hex'));
        let decrypted = decipher.update(data, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        // Keep the 0x prefix if it exists, as private keys often include it
        // return decrypted.startsWith("0x") ? decrypted.slice(2) : decrypted; // Original logic
        return decrypted; // Return with 0x if present
    } catch (error) {
        console.error('fn_decrypt_db error:', error);
        // Avoid exposing sensitive details in the error message if possible
        throw new Error('Failed to parse or decrypt database data');
    }
}

// Address validation (Local - No RPC Check Needed)
async function isAddressValid(address) {
    // Check if web3 utils are available even if RPC is disabled
    if (web3 && web3.utils) {
        return web3.utils.isAddress(address);
    } else if (process.env.G_RPC === 'N') {
        // Basic regex check if web3 utils unavailable
        console.warn("Performing basic address validation as Web3 utils are unavailable (G_RPC=N)");
        return /^0x[a-fA-F0-9]{40}$/.test(address);
    } else {
        // This case shouldn't happen if initialization logic is correct
        console.error("Web3 utils not available for address validation.");
        return false;
    }
}

// Get Balance (Requires RPC)
async function getBalanceWeb3(address) {
    if (isRpcDisabled()) return '0'; // Return '0' as a string consistent with fromWeiWeb3 output
    try {
        // Added await here
        const balanceWei = await web3.eth.getBalance(address);
        // Return Wei balance as string
        return balanceWei.toString();
    } catch (error) {
        console.error('Error getBalanceWeb3 ', error.message);
        // Don't throw RPC error, return 0 if it fails when enabled
        if (error.message.includes("CONNECTION ERROR") || error.message.includes("Failed to connect")) {
             return '0';
        }
        // For other errors, maybe re-throw or return '0'
        return '0';
    }
}

// Wei to Ether conversion (Local - No RPC Check Needed)
const { BigNumber } = require('bignumber.js'); // Ensure bignumber.js is installed

/**
 * Wei 단위를 Ether 단위로 변환합니다. (RPC 연결 불필요)
 * @param {string|number|BigNumber} balanceWei - Wei 단위의 값
 * @returns {string} Ether 단위의 값 (문자열)
 */
async function fromWeiWeb3(balanceWei) {
  try {
    // Handle null or undefined input
    if (balanceWei === null || balanceWei === undefined) {
        return '0';
    }
    const wei = new BigNumber(balanceWei);
    const ether = wei.dividedBy(new BigNumber('1e18')); // 10의 18제곱으로 나눔
    return ether.toString();
  } catch (error) {
    console.error('Error converting from Wei:', error.message, `Input: ${balanceWei}`);
    // Return '0' or throw error based on how critical this conversion is
    return '0'; // Safest default
    // throw new Error('Failed to convert from Wei');
  }
}


module.exports = {
    // Transaction Sending Functions (Throw error if G_RPC=N)
    sendTransactionCoin,
    sendTransactionToken,
    createMemeToken,
    set_buyMemeToken,
    set_sellMemeToken,
    set_approveToken,

    // Data Fetching Functions (Return default if G_RPC=N)
    getAllMemeTokens,
    getTokenDetail,
    getMemeTokenDetails,
    get_calculateCost, // Or throw error? Returning '0' might be misleading. Let's make it throw.
    getBalanceWeb3, // Returns '0' string if G_RPC=N or connection error

    // Wallet/Account Management
    fn_generateWallet, // Tries to import key if G_RPC != N
    fn_getWallet, // DB only
    fn_getPrivateKey, // DB only
    fn_unlockAccount, // Returns false if G_RPC=N or fails
    fn_importRawKey, // Returns null if G_RPC=N or fails

    // Utility Functions (Local)
    fn_encrypt,
    fn_decrypt,
    fn_decrypt_db,
    isAddressValid,
    fromWeiWeb3, // Local conversion
    getCurrentBlockNumber, // Returns 0 if G_RPC=N
};

// Modify get_calculateCost to throw error if RPC disabled
async function get_calculateCost(totalSupply, purchaseAmount) {
    if (isRpcDisabled()) throw new Error("RPC is disabled (G_RPC=N), cannot calculate cost."); // Changed to throw
    try {
        const factoryContract = new web3.eth.Contract(ABI, FACTORY_ADDRESS);
        const cost_WEI = await factoryContract.methods.calculateCost(totalSupply.toString(), purchaseAmount.toString()).call();
        return web3.utils.fromWei(cost_WEI, 'ether');
    } catch (error) {
        console.error('Error calculating cost:', error.message, error.stack);
        if (error.message.includes("CONNECTION ERROR") || error.message.includes("Failed to connect")) {
            throw new Error("Failed to connect to the RPC endpoint");
        }
        throw error;
    }
}
// Re-assign the modified function to exports
module.exports.get_calculateCost = get_calculateCost;

// Ensure BigNumber is required at the top
