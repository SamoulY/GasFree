// PHAROS Atlantic Testnet Gas-Free Faucet Plugin - Embed with one line of code
(function() {
    'use strict';
    
    // 配置 - PHAROS Atlantic Testnet
    const CONFIG = {
        contractAddress: document.currentScript.getAttribute('data-contract') || '0x171026a74CE726CD802fFC2e519036c22aa7F56b',
        serverUrl: document.currentScript.getAttribute('data-server') || 'http://localhost:3000',
        buttonPosition: document.currentScript.getAttribute('data-position') || 'bottom-right',
        buttonText: document.currentScript.getAttribute('data-text') || 'Get Free PHRS',
        buttonColor: document.currentScript.getAttribute('data-color') || '#2c82e5' // 蓝白主题主色调
    };
    
    // 全局变量
    let isOpen = false;
    let userAddress = null;
    let signature = null;
    let nonce = null;
    let deadline = null;
    let adTimer = null;
    
    // 创建浮动按钮 - 蓝白扁平清新风
    function createFloatingButton() {
        const button = document.createElement('button');
        button.id = 'pharos-faucet-button';
        button.innerHTML = `<i class="fas fa-water" style="color: white;"></i> ${CONFIG.buttonText}`;
        button.style.cssText = `
            position: fixed;
            z-index: 999999;
            background: linear-gradient(135deg, ${CONFIG.buttonColor} 0%, #6ba8f2 100%);
            color: white;
            border: none;
            border-radius: 50px;
            padding: 14px 28px;
            font-size: 15px;
            font-weight: 600;
            cursor: pointer;
            box-shadow: 0 6px 24px rgba(44, 130, 229, 0.3);
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            display: flex;
            align-items: center;
            gap: 10px;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.2);
            letter-spacing: 0.3px;
        `;
        
        // 设置位置
        switch(CONFIG.buttonPosition) {
            case 'top-left':
                button.style.top = '24px';
                button.style.left = '24px';
                break;
            case 'top-right':
                button.style.top = '24px';
                button.style.right = '24px';
                break;
            case 'bottom-left':
                button.style.bottom = '24px';
                button.style.left = '24px';
                break;
            case 'center-right':
                button.style.top = '50%';
                button.style.right = '24px';
                button.style.transform = 'translateY(-50%)';
                break;
            case 'center-left':
                button.style.top = '50%';
                button.style.left = '24px';
                button.style.transform = 'translateY(-50%)';
                break;
            default: // bottom-right
                button.style.bottom = '24px';
                button.style.right = '24px';
        }
        
        button.onmouseenter = () => {
            button.style.transform = 'translateY(-4px) scale(1.05)';
            button.style.boxShadow = '0 12px 32px rgba(44, 130, 229, 0.4)';
        };
        
        button.onmouseleave = () => {
            if (!button.style.transform.includes('translateY(-50%)')) {
                button.style.transform = '';
            }
            button.style.boxShadow = '0 6px 24px rgba(44, 130, 229, 0.3)';
        };
        
        button.onclick = (e) => {
            e.stopPropagation();
            if (!isOpen) {
                openModal();
            } else {
                closeModal();
            }
        };
        
        document.body.appendChild(button);
        
        // 添加Font Awesome图标
        if (!document.querySelector('link[href*="font-awesome"]')) {
            const faLink = document.createElement('link');
            faLink.rel = 'stylesheet';
            faLink.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css';
            document.head.appendChild(faLink);
        }
    }
    
    // 创建模态框 - 蓝白扁平清新风
    function createModal() {
        const modal = document.createElement('div');
        modal.id = 'pharos-faucet-modal';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.6);
            z-index: 1000000;
            display: none;
            justify-content: center;
            align-items: center;
            backdrop-filter: blur(8px);
            animation: fadeIn 0.3s ease;
            padding: 20px;
        `;
        
        modal.innerHTML = `
            <div id="pharos-faucet-container" style="
                background: white;
                border-radius: 24px;
                box-shadow: 0 20px 60px rgba(0,0,0,0.2);
                width: 100%;
                max-width: 480px;
                max-height: 90vh;
                overflow-y: auto;
                position: relative;
                border: 1px solid rgba(44, 130, 229, 0.1);
                animation: slideUp 0.4s cubic-bezier(0.4, 0, 0.2, 1);
            ">
                <button id="close-modal" style="
                    position: absolute;
                    top: 20px;
                    right: 20px;
                    background: rgba(44, 130, 229, 0.1);
                    border: none;
                    width: 36px;
                    height: 36px;
                    border-radius: 50%;
                    font-size: 20px;
                    color: #4a5568;
                    cursor: pointer;
                    z-index: 10;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.3s;
                ">×</button>
                
                <div style="
                    background: linear-gradient(135deg, ${CONFIG.buttonColor} 0%, #6ba8f2 100%);
                    color: white;
                    padding: 32px 28px;
                    text-align: center;
                    border-radius: 24px 24px 0 0;
                    position: relative;
                    overflow: hidden;
                ">
                    <div style="position: absolute; top: -50px; right: -50px; width: 150px; height: 150px; background: rgba(255,255,255,0.1); border-radius: 50%;"></div>
                    <div style="position: absolute; bottom: -30px; left: -30px; width: 100px; height: 100px; background: rgba(255,255,255,0.1); border-radius: 50%;"></div>
                    
                    <div style="font-size: 48px; margin-bottom: 16px; color: white; filter: drop-shadow(0 4px 8px rgba(0,0,0,0.1));">
                        <i class="fas fa-water"></i>
                    </div>
                    <h2 style="font-size: 24px; margin-bottom: 10px; font-weight: 700; letter-spacing: -0.5px;">PHAROS Faucet</h2>
                    <p style="opacity: 0.95; font-size: 15px; margin-bottom: 16px;">Get 0.01 PHRS test tokens - No gas fees!</p>
                    <span style="display: inline-block; background: rgba(255,255,255,0.2); color: white; padding: 6px 16px; border-radius: 20px; font-size: 12px; font-weight: 600; margin-top: 8px; backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.3);">
                        Atlantic Testnet
                    </span>
                </div>
                
                <div style="padding: 32px 28px;">
                    <div id="status-message" style="
                        padding: 16px;
                        border-radius: 14px;
                        margin: 16px 0;
                        font-size: 14px;
                        display: none;
                        line-height: 1.5;
                    "></div>
                    
                    <div id="wallet-info" style="
                        display: none;
                        align-items: center;
                        justify-content: space-between;
                        padding: 16px;
                        background: #f0f5ff;
                        border-radius: 14px;
                        margin-bottom: 20px;
                        border: 1px solid rgba(44, 130, 229, 0.1);
                    ">
                        <div style="font-weight: 600; color: #1a365d;">
                            <i class="fas fa-wallet"></i> Wallet:
                        </div>
                        <div id="wallet-address" style="
                            font-family: monospace;
                            font-size: 13px;
                            color: #4a5568;
                            background: white;
                            padding: 8px 14px;
                            border-radius: 10px;
                            border: 1px solid rgba(44, 130, 229, 0.2);
                            cursor: pointer;
                            transition: all 0.3s;
                            max-width: 60%;
                            overflow: hidden;
                            text-overflow: ellipsis;
                        "></div>
                    </div>
                    
                    <div style="text-align: center; font-size: 28px; font-weight: 700; color: ${CONFIG.buttonColor}; margin: 20px 0; display: flex; align-items: center; justify-content: center; gap: 12px;">
                        0.01 PHRS <span style="display: inline-block; background: linear-gradient(135deg, #38b2ac 0%, #4fd1c7 100%); color: white; padding: 5px 14px; border-radius: 20px; font-size: 12px; font-weight: 700; letter-spacing: 0.5px;">No Gas Fees</span>
                    </div>
                    
                    <!-- 步骤1 -->
                    <div style="display: flex; align-items: center; margin-bottom: 20px; padding: 20px; border-radius: 14px; background: white; border: 2px solid #f0f5ff; transition: all 0.3s;">
                        <div style="width: 36px; height: 36px; background: #f0f5ff; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 16px; font-weight: 700; color: #4a5568; font-size: 14px;">1</div>
                        <div>
                            <h3 style="font-size: 16px; color: #1a365d; margin-bottom: 6px; font-weight: 600;">Connect Wallet</h3>
                            <p style="font-size: 14px; color: #4a5568;">Connect MetaMask to PHAROS Atlantic Testnet</p>
                        </div>
                    </div>
                    
                    <button id="connect-wallet-btn" style="
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        gap: 10px;
                        width: 100%;
                        padding: 16px;
                        border: none;
                        border-radius: 12px;
                        font-size: 16px;
                        font-weight: 600;
                        cursor: pointer;
                        transition: all 0.3s;
                        margin-bottom: 20px;
                        background: linear-gradient(135deg, ${CONFIG.buttonColor} 0%, #4a9fff 100%);
                        color: white;
                        box-shadow: 0 4px 15px rgba(44, 130, 229, 0.2);
                    ">
                        <i class="fas fa-wallet"></i> Connect MetaMask
                    </button>
                    
                    <!-- 步骤2 -->
                    <div style="display: flex; align-items: center; margin-bottom: 20px; padding: 20px; border-radius: 14px; background: white; border: 2px solid #f0f5ff; transition: all 0.3s;">
                        <div style="width: 36px; height: 36px; background: #f0f5ff; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 16px; font-weight: 700; color: #4a5568; font-size: 14px;">2</div>
                        <div>
                            <h3 style="font-size: 16px; color: #1a365d; margin-bottom: 6px; font-weight: 600;">Verify Human</h3>
                            <p style="font-size: 14px; color: #4a5568;">Watch a short ad to prove you're human</p>
                        </div>
                    </div>
                    
                    <button id="watch-ad-btn" disabled style="
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        gap: 10px;
                        width: 100%;
                        padding: 16px;
                        border: none;
                        border-radius: 12px;
                        font-size: 16px;
                        font-weight: 600;
                        cursor: pointer;
                        transition: all 0.3s;
                        margin-bottom: 20px;
                        background: #f0f5ff;
                        color: #475569;
                        border: 1px solid rgba(44, 130, 229, 0.2);
                    ">
                        <i class="fas fa-play-circle"></i> Watch Ad (5s)
                    </button>
                    
                    <div id="ad-container" style="
                        text-align: center;
                        padding: 25px;
                        background: #f7fafd;
                        border-radius: 14px;
                        margin: 20px 0;
                        border: 2px dashed rgba(44, 130, 229, 0.3);
                        display: none;
                    ">
                        <h3 style="color: ${CONFIG.buttonColor}; margin-bottom: 15px;">
                            <i class="fas fa-ad"></i> Advertisement
                        </h3>
                        <p style="color: #4a5568; margin-bottom: 10px;">Please watch this demo ad for 5 seconds</p>
                        <div id="ad-timer" style="font-size: 60px; font-weight: 800; color: ${CONFIG.buttonColor}; margin: 20px 0; font-family: monospace;">5</div>
                        <p style="color: #4a5568; font-size: 14px;">Ad verification in progress...</p>
                    </div>
                    
                    <!-- 步骤3 -->
                    <div style="display: flex; align-items: center; margin-bottom: 20px; padding: 20px; border-radius: 14px; background: white; border: 2px solid #f0f5ff; transition: all 0.3s;">
                        <div style="width: 36px; height: 36px; background: #f0f5ff; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 16px; font-weight: 700; color: #4a5568; font-size: 14px;">3</div>
                        <div>
                            <h3 style="font-size: 16px; color: #1a365d; margin-bottom: 6px; font-weight: 600;">Claim Tokens (Gas-Free)</h3>
                            <p style="font-size: 14px; color: #4a5568;">Get 0.01 PHRS test tokens - No gas fees!</p>
                        </div>
                    </div>
                    
                    <button id="claim-btn" disabled style="
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        gap: 10px;
                        width: 100%;
                        padding: 16px;
                        border: none;
                        border-radius: 12px;
                        font-size: 16px;
                        font-weight: 600;
                        cursor: pointer;
                        transition: all 0.3s;
                        margin-bottom: 20px;
                        background: linear-gradient(135deg, ${CONFIG.buttonColor} 0%, #4a9fff 100%);
                        color: white;
                        box-shadow: 0 4px 15px rgba(44, 130, 229, 0.2);
                    ">
                        <i class="fas fa-faucet"></i> Claim 0.01 PHRS (Gas-Free)
                    </button>
                    
                    <div style="background: #f7fafd; padding: 20px; border-radius: 14px; margin-top: 20px; font-size: 14px; color: #4a5568; border: 1px solid rgba(44, 130, 229, 0.1);">
                        <p style="margin-bottom: 12px; line-height: 1.5;">
                            <i class="fas fa-info-circle" style="color: #4a9fff; margin-right: 10px;"></i> 
                            <strong>How it works:</strong> You watch an ad, we pay the gas! Each wallet can claim once every 24 hours.
                        </p>
                        <p style="margin-bottom: 12px; line-height: 1.5;">
                            <i class="fas fa-bolt" style="color: #4a9fff; margin-right: 10px;"></i> 
                            <strong>Contract:</strong> ${CONFIG.contractAddress.substring(0, 10)}...
                        </p>
                        <p style="margin-bottom: 12px; line-height: 1.5;">
                            <i class="fas fa-server" style="color: #4a9fff; margin-right: 10px;"></i> 
                            <strong>Network:</strong> PHAROS Atlantic Testnet
                        </p>
                    </div>
                </div>
            </div>
            
            <style>
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                
                @keyframes slideUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                
                #pharos-faucet-container button:hover:not(:disabled) {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 20px rgba(44, 130, 229, 0.3);
                }
                
                #pharos-faucet-container button:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                    transform: none !important;
                    box-shadow: none !important;
                }
                
                #close-modal:hover {
                    background: rgba(44, 130, 229, 0.2) !important;
                    transform: rotate(90deg);
                }
            </style>
        `;
        
        document.body.appendChild(modal);
        
        // 关闭按钮事件
        modal.querySelector('#close-modal').onclick = closeModal;
        
        // 点击模态框背景关闭
        modal.onclick = function(e) {
            if (e.target === modal) {
                closeModal();
            }
        };
    }
    
    // 打开模态框
    function openModal() {
        const modal = document.getElementById('pharos-faucet-modal');
        modal.style.display = 'flex';
        isOpen = true;
        
        // 初始化按钮事件
        initModalEvents();
        
        // 检查钱包连接状态
        checkWallet();
    }
    
    // 关闭模态框
    function closeModal() {
        const modal = document.getElementById('pharos-faucet-modal');
        modal.style.display = 'none';
        isOpen = false;
        
        // 清除广告计时器
        if (adTimer) {
            clearInterval(adTimer);
            adTimer = null;
        }
    }
    
    // 初始化模态框事件
    function initModalEvents() {
        // 连接钱包按钮
        document.getElementById('connect-wallet-btn').onclick = connectWallet;
        
        // 观看广告按钮
        document.getElementById('watch-ad-btn').onclick = startAd;
        
        // 领取按钮
        document.getElementById('claim-btn').onclick = claimTokens;
        
        // 复制钱包地址
        const walletAddressEl = document.getElementById('wallet-address');
        if (walletAddressEl) {
            walletAddressEl.onclick = copyToClipboard;
        }
    }
    
    // 检查钱包连接
    async function checkWallet() {
        if (!window.ethereum) {
            showStatus("Please install MetaMask", "error");
            return;
        }
        
        try {
            const accounts = await ethereum.request({ method: 'eth_accounts' });
            if (accounts.length > 0) {
                userAddress = accounts[0];
                updateWalletDisplay();
                checkStatus();
            }
        } catch (error) {
            console.error("Check wallet error:", error);
        }
    }
    
    // 连接钱包
    async function connectWallet() {
        if (!window.ethereum) {
            showStatus("Install MetaMask first", "error");
            return;
        }
        
        try {
            showStatus("Connecting...", "info");
            
            // 切换网络到 PHAROS Atlantic Testnet
            await switchNetwork();
            
            // 获取账户
            const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
            userAddress = accounts[0];
            
            updateWalletDisplay();
            checkStatus();
            
            showStatus("Connected!", "success");
            
        } catch (error) {
            console.error("Connect error:", error);
            if (error.code === 4001) {
                showStatus("Connection rejected", "error");
            } else {
                showStatus("Connection error: " + error.message, "error");
            }
        }
    }
    
    // 切换网络到 PHAROS
    async function switchNetwork() {
        const pharosNetwork = {
            chainId: "0xa8491", // 688689 in hex
            chainName: "PHAROS Atlantic Testnet",
            nativeCurrency: { name: "PHRS", symbol: "PHRS", decimals: 18 },
            rpcUrls: ["https://atlantic.dplabs-internal.com"],
            blockExplorerUrls: ["https://atlantic.pharosscan.xyz"]
        };
        
        try {
            await ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: pharosNetwork.chainId }]
            });
        } catch (error) {
            if (error.code === 4902) {
                await ethereum.request({
                    method: 'wallet_addEthereumChain',
                    params: [pharosNetwork]
                });
            } else {
                throw error;
            }
        }
    }
    
    // 更新钱包显示
    function updateWalletDisplay() {
        if (!userAddress) return;
        
        const shortAddr = userAddress.substring(0, 6) + "..." + userAddress.substring(38);
        document.getElementById('wallet-address').textContent = shortAddr;
        document.getElementById('wallet-info').style.display = 'flex';
        document.getElementById('watch-ad-btn').disabled = false;
        
        // 更新步骤样式
        const step1 = document.querySelector('#pharos-faucet-container > div:nth-child(2) > div:nth-child(3)');
        if (step1) {
            step1.style.borderColor = CONFIG.buttonColor;
            step1.querySelector('div').style.background = CONFIG.buttonColor;
            step1.querySelector('div').style.color = 'white';
        }
    }
    
    // 复制地址到剪贴板
    function copyToClipboard() {
        if (!userAddress) return;
        
        navigator.clipboard.writeText(userAddress).then(() => {
            const originalText = document.getElementById('wallet-address').textContent;
            document.getElementById('wallet-address').textContent = "Copied!";
            document.getElementById('wallet-address').style.color = "#38b2ac";
            document.getElementById('wallet-address').style.fontWeight = "600";
            
            setTimeout(() => {
                document.getElementById('wallet-address').textContent = originalText;
                document.getElementById('wallet-address').style.color = "";
                document.getElementById('wallet-address').style.fontWeight = "";
            }, 2000);
        });
    }
    
    // 检查状态
    async function checkStatus() {
        if (!userAddress) return;
        
        try {
            const response = await fetch(`${CONFIG.serverUrl}/claim-status/${userAddress}`);
            const data = await response.json();
            
            if (data.error) {
                console.warn("Status check error:", data.error);
            } else if (data.can_claim === false) {
                const hours = data.hours_left || (data.time_left / 3600).toFixed(1);
                document.getElementById('watch-ad-btn').disabled = true;
                document.getElementById('watch-ad-btn').innerHTML = `<i class="fas fa-clock"></i> Wait ${hours}h`;
                document.getElementById('claim-btn').disabled = true;
                document.getElementById('claim-btn').innerHTML = `<i class="fas fa-clock"></i> Available in ${hours}h`;
                showStatus(`Next claim in ${hours} hours`, "info");
                
                // 更新步骤样式
                const step2 = document.querySelector('#pharos-faucet-container > div:nth-child(2) > div:nth-child(5)');
                if (step2) {
                    step2.style.borderColor = '#38b2ac';
                    step2.querySelector('div').style.background = '#38b2ac';
                    step2.querySelector('div').style.color = 'white';
                }
            }
        } catch (error) {
            console.error("Status check error:", error);
        }
    }
    
    // 开始广告
    function startAd() {
        document.getElementById('ad-container').style.display = 'block';
        document.getElementById('watch-ad-btn').disabled = true;
        document.getElementById('watch-ad-btn').innerHTML = '<i class="fas fa-spinner fa-spin"></i> Watching...';
        
        let seconds = 5;
        document.getElementById('ad-timer').textContent = seconds;
        
        adTimer = setInterval(() => {
            seconds--;
            document.getElementById('ad-timer').textContent = seconds;
            
            if (seconds <= 0) {
                clearInterval(adTimer);
                finishAd();
            }
        }, 1000);
        
        showStatus("Watching ad...", "info");
    }
    
    // 完成广告
    async function finishAd() {
        try {
            showStatus("Getting signature...", "info");
            
            const response = await fetch(`${CONFIG.serverUrl}/verify-ad`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    wallet: userAddress,
                    adToken: "demo_ad_ok"
                })
            });
            
            const data = await response.json();
            
            if (data.success) {
                signature = data.signature;
                nonce = data.nonce;
                deadline = data.deadline;
                
                // 确保签名有0x前缀
                if (!signature.startsWith('0x')) {
                    signature = '0x' + signature;
                }
                
                document.getElementById('ad-container').innerHTML = `
                    <div style="color:#38b2ac;">
                        <i class="fas fa-check-circle" style="font-size:48px; margin-bottom: 15px;"></i>
                        <h3 style="color:#38b2ac; margin-bottom: 10px;">Ready! (Gas-Free)</h3>
                        <p style="color:#4a5568;">Signature received - No gas fee required!</p>
                    </div>
                `;
                
                document.getElementById('watch-ad-btn').innerHTML = '<i class="fas fa-check"></i> Ad Completed';
                document.getElementById('claim-btn').disabled = false;
                
                // 更新步骤样式
                const step2 = document.querySelector('#pharos-faucet-container > div:nth-child(2) > div:nth-child(5)');
                if (step2) {
                    step2.style.borderColor = '#38b2ac';
                    step2.querySelector('div').style.background = '#38b2ac';
                    step2.querySelector('div').style.color = 'white';
                }
                
                const step3 = document.querySelector('#pharos-faucet-container > div:nth-child(2) > div:nth-child(8)');
                if (step3) {
                    step3.style.borderColor = CONFIG.buttonColor;
                    step3.querySelector('div').style.background = CONFIG.buttonColor;
                    step3.querySelector('div').style.color = 'white';
                }
                
                showStatus("Ready to claim! No gas fee required.", "success");
                
            } else {
                console.error("Server error:", data.error);
                showStatus("Error: " + data.error, "error");
                document.getElementById('watch-ad-btn').disabled = false;
                document.getElementById('watch-ad-btn').innerHTML = '<i class="fas fa-play-circle"></i> Try Again';
            }
            
        } catch (error) {
            console.error("Finish ad error:", error);
            showStatus("Server error: " + error.message, "error");
            document.getElementById('watch-ad-btn').disabled = false;
            document.getElementById('watch-ad-btn').innerHTML = '<i class="fas fa-play-circle"></i> Try Again';
        }
    }
    
    // 领取代币
    async function claimTokens() {
        if (!signature || nonce === null || deadline === null) {
            showStatus("No signature or missing data", "error");
            return;
        }
        
        const claimBtn = document.getElementById('claim-btn');
        claimBtn.disabled = true;
        claimBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
        
        try {
            showStatus("Sending transaction via relay (gas-free)...", "info");
            
            const response = await fetch(`${CONFIG.serverUrl}/relay-claim`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    wallet: userAddress,
                    signature: signature,
                    nonce: nonce,
                    deadline: deadline
                })
            });
            
            const data = await response.json();
            
            if (data.success) {
                // 成功
                claimBtn.innerHTML = '<i class="fas fa-check"></i> Success!';
                claimBtn.style.background = 'linear-gradient(135deg, #38b2ac 0%, #4fd1c7 100%)';
                
                const explorerUrl = data.explorer_url || `https://atlantic.pharosscan.xyz/tx/${data.tx_hash}`;
                showStatus(`
                    <strong>Success!</strong> Gas-free transaction submitted.<br>
                    <a href="${explorerUrl}" target="_blank" style="color:${CONFIG.buttonColor};text-decoration:underline; font-weight:600;">
                        <i class="fas fa-external-link-alt"></i> View on PharosScan
                    </a><br>
                    Transaction Hash: ${data.tx_hash.substring(0, 20)}...<br>
                    <small style="color:#4a5568;">It may take a few minutes to confirm.</small>
                `, "success");
                
                // 禁用按钮，24小时内不能再领取
                document.getElementById('watch-ad-btn').disabled = true;
                document.getElementById('watch-ad-btn').innerHTML = '<i class="fas fa-clock"></i> 24h Wait';
                document.getElementById('claim-btn').disabled = true;
                document.getElementById('claim-btn').innerHTML = '<i class="fas fa-check"></i> Claimed (24h Wait)';
                
                // 更新状态
                setTimeout(() => checkStatus(), 3000);
                
            } else {
                console.error("Relay server error:", data.error);
                claimBtn.disabled = false;
                claimBtn.innerHTML = '<i class="fas fa-faucet"></i> Claim 0.01 PHRS (Gas-Free)';
                
                showStatus("Error: " + data.error, "error");
            }
            
        } catch (error) {
            console.error("Claim error details:", error);
            claimBtn.disabled = false;
            claimBtn.innerHTML = '<i class="fas fa-faucet"></i> Claim 0.01 PHRS (Gas-Free)';
            
            showStatus("Server error: " + error.message, "error");
        }
    }
    
    // 显示状态
    function showStatus(message, type) {
        const element = document.getElementById('status-message');
        element.innerHTML = message;
        element.className = ''; // 清除之前的类
        element.style.display = 'block';
        
        switch(type) {
            case 'success':
                element.style.background = 'rgba(56, 178, 172, 0.1)';
                element.style.color = '#065f46';
                element.style.border = '1px solid rgba(56, 178, 172, 0.2)';
                break;
            case 'error':
                element.style.background = 'rgba(245, 101, 101, 0.1)';
                element.style.color = '#991b1b';
                element.style.border = '1px solid rgba(245, 101, 101, 0.2)';
                break;
            case 'info':
                element.style.background = 'rgba(74, 159, 255, 0.1)';
                element.style.color = '#1e40af';
                element.style.border = '1px solid rgba(74, 159, 255, 0.2)';
                break;
        }
        
        if (type === 'success') {
            setTimeout(() => {
                element.style.display = 'none';
            }, 10000);
        } else if (type === 'info') {
            setTimeout(() => {
                element.style.display = 'none';
            }, 5000);
        }
    }
    
    // 监听钱包变化
    function initWalletListeners() {
        if (window.ethereum) {
            ethereum.on('accountsChanged', (accounts) => {
                if (accounts.length === 0) {
                    userAddress = null;
                    const walletInfo = document.getElementById('wallet-info');
                    if (walletInfo) walletInfo.style.display = 'none';
                    showStatus("Wallet disconnected", "info");
                } else {
                    userAddress = accounts[0];
                    updateWalletDisplay();
                    checkStatus();
                }
            });
            
            ethereum.on('chainChanged', () => {
                window.location.reload();
            });
        }
    }
    
    // 初始化
    function init() {
        // 创建浮动按钮
        createFloatingButton();
        
        // 创建模态框
        createModal();
        
        // 初始化钱包监听器
        initWalletListeners();
        
        // 添加键盘快捷键 (Esc键关闭模态框)
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && isOpen) {
                closeModal();
            }
        });
        
        console.log('PHAROS Gas-Free Faucet Plugin loaded!');
    }
    
    // 等待DOM加载完成
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
    // 暴露公共API
    window.PharosFaucet = {
        open: openModal,
        close: closeModal,
        setConfig: function(config) {
            Object.assign(CONFIG, config);
        },
        getConfig: function() {
            return CONFIG;
        }
    };
    
})();
