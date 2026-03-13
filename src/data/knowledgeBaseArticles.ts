import type { Article } from '@/components/knowledge-base/ArticleCard';

/**
 * Knowledge Base Articles
 * Based on NOVUNT_COMPREHENSIVE_KNOWLEDGE_BASE.md
 */
export const knowledgeBaseArticles: Article[] = [
  // Getting Started
  {
    id: 'platform-overview',
    title: 'Platform Overview',
    description:
      'Learn what Novunt is, its core philosophy, and key features. Perfect for understanding the platform at a glance.',
    category: 'getting-started',
    readTime: 5,
    tags: ['Introduction', 'Features', 'Getting Started'],
    content: `
      <h2>What is Novunt?</h2>
      <p>Novunt is a modern financial platform designed to help users achieve their financial goals through goal-based staking, daily profit distribution, and a comprehensive earning system. Whether you're saving for a specific goal or building long-term wealth, Novunt provides the tools and opportunities to make it happen.</p>
      
      <h3>Core Philosophy</h3>
      <p>At Novunt, we believe in transparency, security, and empowering our users to take control of their financial future. Our platform combines cutting-edge technology with user-friendly features to create an accessible and rewarding experience.</p>
      
      <h3>Key Features</h3>
      <ul>
        <li><strong>Goal-Based Staking:</strong> Create custom financial goals and stake towards them with progress tracking from 100% to 200%</li>
        <li><strong>Daily Returns (ROS):</strong> Earn daily profits on your stakes with transparent distribution</li>
        <li><strong>Two-Wallet System:</strong> Separate deposit and earnings wallets for better financial management</li>
        <li><strong>Multi-Level Earning:</strong> Three-tier pool system, referral bonuses, and achievement rewards</li>
        <li><strong>Rank Progression:</strong> Level up through 6 ranks with increasing benefits and opportunities</li>
        <li><strong>Secure & Reliable:</strong> 2FA authentication, secure transactions, and comprehensive security measures</li>
      </ul>
      
      <h3>Getting Started</h3>
      <p>To begin your journey with Novunt, simply register an account, complete your profile, make your first deposit, and create your first goal. Our platform is designed to guide you through each step, making it easy for both beginners and experienced users.</p>
      
      <p>For detailed information on specific features, explore our other knowledge base articles or contact our support team through the Novunt Assistant.</p>
    `,
  },
  {
    id: 'getting-started-guide',
    title: 'Getting Started Guide',
    description:
      'Step-by-step guide to register, complete your profile, make your first deposit, and create your first goal.',
    category: 'getting-started',
    readTime: 10,
    tags: ['Tutorial', 'Beginner', 'Setup'],
    content: `
      <h2>Welcome to Novunt!</h2>
      <p>This comprehensive guide will walk you through everything you need to get started on the Novunt platform. Follow these steps to begin your financial journey.</p>
      
      <h3>Step 1: Register Your Account</h3>
      <ol>
        <li>Visit the Novunt registration page</li>
        <li>Enter your email address and create a strong password</li>
        <li>Accept the terms and conditions</li>
        <li>Click "Register" to create your account</li>
        <li>Verify your email address through the confirmation link sent to your inbox</li>
      </ol>
      
      <h3>Step 2: Complete Your Profile</h3>
      <p>To unlock all features and qualify for bonuses, complete your profile:</p>
      <ul>
        <li>Add your personal information (first name, last name)</li>
        <li>Upload a profile picture</li>
        <li>Verify your social media accounts (optional but recommended)</li>
        <li>Complete profile verification to unlock advanced features</li>
      </ul>
      <p><strong>Tip:</strong> Completing your profile may qualify you for registration bonuses and unlock additional earning opportunities.</p>
      
      <h3>Step 3: Set Up Security</h3>
      <p>Protect your account with these essential security measures:</p>
      <ul>
        <li>Enable Two-Factor Authentication (2FA) in your account settings</li>
        <li>Use a strong, unique password</li>
        <li>Keep your recovery codes in a safe place</li>
      </ul>
      
      <h3>Step 4: Make Your First Deposit</h3>
      <ol>
        <li>Navigate to the Wallets section</li>
        <li>Click on "Deposit"</li>
        <li>Network: BEP20 (Binance Smart Chain) only</li>
        <li>Send USDT to the provided wallet address</li>
        <li>Wait for confirmation (usually takes a few minutes)</li>
        <li>Your funds will appear in your Deposit Wallet</li>
      </ol>
      <p><strong>Important:</strong> Always double-check the network and address before sending funds. Novunt only accepts USDT (Tether).</p>
      
      <h3>Step 5: Create Your First Goal</h3>
      <ol>
        <li>Go to the Stakes section</li>
        <li>Click "Create New Goal"</li>
        <li>Choose a goal category (e.g., Emergency Fund, Vacation, Staking)</li>
        <li>Set your target amount</li>
        <li>Select the stake amount from your Deposit Wallet</li>
        <li>Review and confirm your goal</li>
      </ol>
      <p>Once created, your goal will start earning daily returns immediately!</p>
      
      <h3>Step 6: Explore Earning Opportunities</h3>
      <p>Now that you're set up, explore additional ways to earn:</p>
      <ul>
        <li><strong>Referral Program:</strong> Share your referral link and earn from your network</li>
        <li><strong>Pool System:</strong> Qualify for Stake Pool, Performance Pool, or Premium Pool</li>
        <li><strong>Achievements:</strong> Complete tasks to earn badges and NXP points</li>
        <li><strong>Rank Progression:</strong> Level up your rank for better rewards</li>
      </ul>
      
      <h3>Next Steps</h3>
      <p>Congratulations! You're now ready to start earning on Novunt. Continue learning by exploring our other knowledge base articles, particularly those about staking, withdrawals, and the earning systems.</p>
      
      <p>If you have any questions, use the Novunt Assistant (the floating chat icon) to get instant help from our AI assistant.</p>
    `,
  },
  // Wallets & Finance
  {
    id: 'two-wallet-system',
    title: 'Two-Wallet System Explained',
    description:
      'Understanding the Deposit Wallet and Earnings Wallet, how they work, and what you can do with each.',
    category: 'wallets-finance',
    readTime: 8,
    tags: ['Wallets', 'Deposit', 'Earnings'],
    content: `
      <h2>Understanding Novunt's Two-Wallet System</h2>
      <p>Novunt uses a two-wallet system to help you manage your funds more effectively. This system separates your deposited funds from your earnings, providing clarity and better financial control.</p>
      
      <h3>Deposit Wallet</h3>
      <p>The <strong>Deposit Wallet</strong> is where your deposited funds are stored. This is the wallet you use to:</p>
      <ul>
        <li>Receive deposits from external wallets</li>
        <li>Fund new stakes and goals</li>
        <li>Transfer funds to other Novunt users (P2P transfers)</li>
        <li>Withdraw funds back to external wallets</li>
      </ul>
      
      <h4>How Funds Enter Your Deposit Wallet</h4>
      <ol>
        <li>Make a deposit via BEP20 (Binance Smart Chain) network</li>
        <li>Funds appear in your Deposit Wallet after confirmation</li>
        <li>You can then use these funds to create stakes or make transfers</li>
      </ol>
      
      <h3>Earnings Wallet</h3>
      <p>The <strong>Earnings Wallet</strong> is where all your earnings accumulate. This wallet receives:</p>
      <ul>
        <li>Daily profit distributions (ROS) from your stakes</li>
        <li>Referral bonuses and commissions</li>
        <li>Pool distributions</li>
        <li>Registration bonuses</li>
        <li>Achievement rewards</li>
        <li>Any other platform earnings</li>
      </ul>
      
      <h4>Key Features of Earnings Wallet</h4>
      <ul>
        <li><strong>Separate Tracking:</strong> All earnings are clearly separated from your deposited funds</li>
        <li><strong>Withdrawal Ready:</strong> Funds in Earnings Wallet can be withdrawn or transferred</li>
        <li><strong>Staking Option:</strong> You can transfer earnings back to Deposit Wallet to create new stakes</li>
      </ul>
      
      <h3>Transferring Between Wallets</h3>
      <p>You have the flexibility to move funds between wallets:</p>
      <ul>
        <li><strong>Deposit → Stakes:</strong> Automatically deducted when creating a new stake</li>
        <li><strong>Earnings → Deposit:</strong> Transfer earnings to create new stakes or goals</li>
        <li><strong>Both → External:</strong> Withdraw from either wallet to external addresses</li>
      </ul>
      
      <h3>Benefits of the Two-Wallet System</h3>
      <ol>
        <li><strong>Clear Separation:</strong> Easily distinguish between deposited funds and earnings</li>
        <li><strong>Better Tracking:</strong> Monitor your staked amount vs. returns separately</li>
        <li><strong>Flexible Management:</strong> Control how you use both types of funds</li>
        <li><strong>Transparency:</strong> Clear visibility into your financial activity</li>
      </ol>
      
      <h3>Best Practices</h3>
      <ul>
        <li>Keep track of both wallet balances regularly</li>
        <li>Consider creating new stakes with earnings from Earnings Wallet</li>
        <li>Plan your withdrawals based on which wallet has available funds</li>
        <li>Monitor your total available balance (sum of both wallets)</li>
      </ul>
      
      <p>Understanding this system helps you make better financial decisions and maximize your earning potential on Novunt.</p>
    `,
  },
  {
    id: 'deposits-funding',
    title: 'Deposits & Funding',
    description:
      'Complete guide to depositing USDT via BEP20 (Binance Smart Chain) network, limits, and security notes.',
    category: 'wallets-finance',
    readTime: 7,
    tags: ['Deposit', 'Funding', 'Security'],
    content: `
      <h2>How to Deposit Funds to Novunt</h2>
      <p>This guide explains everything you need to know about depositing USDT to your Novunt account safely and efficiently.</p>
      
      <h3>Supported Network</h3>
      <p>Novunt accepts USDT (Tether) deposits via Binance Smart Chain (BEP20) network only:</p>
      <ul>
        <li><strong>BEP20 (Binance Smart Chain):</strong> Lower transaction fees, faster confirmations, secure and reliable</li>
      </ul>
      <p><strong>Important:</strong> Only send USDT via BEP20 network. TRC20 addresses are no longer supported. Do not send other cryptocurrencies, as they may be lost.</p>
      
      <h3>Step-by-Step Deposit Process</h3>
      <ol>
        <li><strong>Navigate to Wallets:</strong> Go to the Wallets section from the main navigation</li>
        <li><strong>Click Deposit:</strong> Select the "Deposit" button in your Deposit Wallet card</li>
        <li><strong>Network:</strong> BEP20 (Binance Smart Chain) is the only supported network</li>
        <li><strong>Copy Address:</strong> Copy the wallet address displayed (or scan the QR code)</li>
        <li><strong>Send from External Wallet:</strong> Paste the address in your external wallet and send USDT</li>
        <li><strong>Wait for Confirmation:</strong> Transactions typically confirm within 5-30 minutes</li>
        <li><strong>Funds Appear:</strong> Once confirmed, funds will appear in your Deposit Wallet</li>
      </ol>
      
      <h3>Deposit Limits</h3>
      <p>Novunt may have minimum and maximum deposit limits:</p>
      <ul>
        <li><strong>Minimum Deposit:</strong> Typically $10-50 USDT</li>
        <li><strong>Maximum Deposit:</strong> May vary based on account verification level</li>
        <li><strong>Daily Limits:</strong> Check your account dashboard for current limits</li>
      </ul>
      <p>Limits are subject to change and may vary based on your account status and verification level.</p>
      
      <h3>Transaction Fees</h3>
      <p>Novunt does not charge deposit fees. However, network fees apply:</p>
      <ul>
        <li><strong>BEP20:</strong> Network fees typically $0.10-1.00</li>
      </ul>
      <p>These fees are paid to the Binance Smart Chain network, not to Novunt.</p>
      
      <h3>Security Best Practices</h3>
      <ul>
        <li><strong>Double-Check Address:</strong> Always verify the wallet address before sending</li>
        <li><strong>Use QR Codes:</strong> Scan QR codes when possible to avoid typing errors</li>
        <li><strong>Network Matching:</strong> Ensure your external wallet uses BEP20 (Binance Smart Chain) network</li>
        <li><strong>Test Transaction:</strong> For large amounts, consider sending a small test amount first</li>
        <li><strong>Secure Your Wallet:</strong> Keep your external wallet credentials secure</li>
        <li><strong>Wait for Confirmations:</strong> Don't send multiple transactions until the first one confirms</li>
      </ul>
      
      <h3>Common Issues & Solutions</h3>
      <h4>Funds Not Appearing</h4>
      <ul>
        <li>Check that enough blockchain confirmations have occurred (usually 12-20)</li>
        <li>Verify you sent USDT, not another cryptocurrency</li>
        <li>Ensure you used BEP20 (Binance Smart Chain) network</li>
        <li>Check the transaction hash on a blockchain explorer</li>
        <li>Contact support if the issue persists</li>
      </ul>
      
      <h4>Wrong Network Used</h4>
      <p>If you sent funds using the wrong network, contact Novunt support immediately. Recovery may be possible but is not guaranteed.</p>
      
      <h3>After Depositing</h3>
      <p>Once your deposit is confirmed and appears in your Deposit Wallet, you can:</p>
      <ul>
        <li>Create new stakes and goals</li>
        <li>Transfer funds to other Novunt users</li>
        <li>Withdraw funds back to external wallets (if needed)</li>
        <li>View transaction history in the Wallets section</li>
      </ul>
      
      <h3>Need Help?</h3>
      <p>If you encounter any issues with deposits, contact Novunt support through the Novunt Assistant or check the transaction status using your transaction hash (TXID) on a blockchain explorer.</p>
    `,
  },
  {
    id: 'withdrawals',
    title: 'Withdrawals',
    description:
      'How to withdraw earnings, withdrawal requirements, fees, limits, and the approval process.',
    category: 'wallets-finance',
    readTime: 8,
    tags: ['Withdrawal', 'Earnings', 'Security'],
    content: `
      <h2>Withdrawing Funds from Novunt</h2>
      <p>Learn how to withdraw your funds from Novunt, including requirements, fees, limits, and the approval process.</p>
      
      <h3>Where to Withdraw From</h3>
      <p>You can withdraw funds from both wallets:</p>
      <ul>
        <li><strong>Deposit Wallet:</strong> Withdraw your deposited funds</li>
        <li><strong>Earnings Wallet:</strong> Withdraw your earned profits and bonuses</li>
      </ul>
      
      <h3>Withdrawal Process</h3>
      <ol>
        <li><strong>Go to Wallets:</strong> Navigate to the Wallets section</li>
        <li><strong>Select Wallet:</strong> Choose the wallet you want to withdraw from</li>
        <li><strong>Click Withdraw:</strong> Select the "Withdraw" button</li>
        <li><strong>Enter Amount:</strong> Specify the amount you want to withdraw</li>
        <li><strong>Network:</strong> BEP20 (Binance Smart Chain) is the only supported network</li>
        <li><strong>Enter Address:</strong> Paste your external wallet address (double-check it!)</li>
        <li><strong>Note:</strong> If you recently changed your wallet address, remember there's a 72-hour moratorium before the new address becomes active for withdrawals</li>
        <li><strong>Review & Submit:</strong> Review all details and confirm the withdrawal</li>
        <li><strong>Wait for Approval:</strong> Withdrawals require approval (usually within 24-48 hours)</li>
        <li><strong>Receive Funds:</strong> Once approved, funds will be sent to your external wallet</li>
      </ol>
      
      <h3>Withdrawal Requirements</h3>
      <p>To ensure security and compliance, withdrawals may require:</p>
      <ul>
        <li><strong>Account Verification:</strong> Complete profile verification for higher limits</li>
        <li><strong>2FA Enabled:</strong> Two-factor authentication is required for all withdrawals</li>
        <li><strong>Minimum Balance:</strong> Ensure you have enough balance to cover fees</li>
        <li><strong>Active Account:</strong> Account must be in good standing</li>
      </ul>
      
      <h3>Withdrawal Limits</h3>
      <p>Withdrawal limits may apply based on:</p>
      <ul>
        <li><strong>Account Level:</strong> Higher verification = higher limits</li>
        <li><strong>Daily Limit:</strong> Maximum amount per day</li>
        <li><strong>Monthly Limit:</strong> Maximum amount per month</li>
        <li><strong>Minimum Withdrawal:</strong> Smallest amount you can withdraw</li>
      </ul>
      <p>Check your account dashboard for current limits applicable to your account.</p>
      
      <h3>Withdrawal Fees</h3>
      <p>Novunt withdrawal fees structure:</p>
      <ul>
        <li><strong>Platform Fee:</strong> 3% of the withdrawal amount</li>
        <li><strong>Network Fee:</strong> Paid to Binance Smart Chain (BEP20) network</li>
        <li><strong>Total Cost:</strong> 3% platform fee + network fee deducted from withdrawal amount</li>
      </ul>
      <p><strong>Fee Calculation Example:</strong> If you withdraw $100, the platform fee is $3 (3%), plus the BEP20 network fee. Network fees are typically $0.10-1.00 for BEP20 transactions.</p>
      <p>Fees are deducted from the withdrawal amount, so ensure you have sufficient balance to cover both the platform fee and network fee.</p>
      
      <h3>Approval Process</h3>
      <p>Withdrawals go through an approval process for security:</p>
      <ol>
        <li><strong>Submission:</strong> Your withdrawal request is submitted</li>
        <li><strong>Review:</strong> Security team reviews the request (usually 24-48 hours)</li>
        <li><strong>Approval:</strong> Once approved, funds are sent</li>
        <li><strong>Processing:</strong> Blockchain transaction is initiated</li>
        <li><strong>Confirmation:</strong> Transaction confirms on the network</li>
      </ol>
      <p><strong>Processing Time:</strong> Most withdrawals are processed within 24-48 hours during business days.</p>
      
      <h3>Security Best Practices</h3>
      <ul>
        <li><strong>Verify Address:</strong> Always double-check the withdrawal address before submitting</li>
        <li><strong>Use QR Codes:</strong> Scan QR codes when possible to avoid errors</li>
        <li><strong>Network Matching:</strong> Ensure your external wallet supports BEP20 (Binance Smart Chain) network</li>
        <li><strong>Enable 2FA:</strong> Add an extra layer of security to your account</li>
        <li><strong>Wallet Address Changes:</strong> Remember that changing your withdrawal address requires a 72-hour moratorium before it becomes active</li>
        <li><strong>Monitor Address Changes:</strong> Check your account settings regularly for any unauthorized wallet address changes</li>
        <li><strong>Start Small:</strong> For first withdrawals, try a small amount to verify the process</li>
        <li><strong>Keep Records:</strong> Save transaction IDs for your records</li>
      </ul>
      
      <h3>Common Issues</h3>
      <h4>Withdrawal Pending</h4>
      <ul>
        <li>Normal processing time is 24-48 hours</li>
        <li>Weekends and holidays may cause delays</li>
        <li>Check your email for status updates</li>
        <li>Contact support if pending longer than 72 hours</li>
      </ul>
      
      <h4>Withdrawal Rejected</h4>
      <p>Common reasons for rejection:</p>
      <ul>
        <li>Invalid wallet address</li>
        <li>Account verification incomplete</li>
        <li>Insufficient balance (after fees)</li>
        <li>Security concerns</li>
      </ul>
      <p>Contact support if your withdrawal is rejected to understand the reason and resolve the issue.</p>
      
      <h3>Tracking Withdrawals</h3>
      <p>You can track your withdrawal status:</p>
      <ul>
        <li>View withdrawal history in the Wallets section</li>
        <li>Check transaction status using the TXID</li>
        <li>Receive email notifications at each stage</li>
      </ul>
      
      <h3>Tips for Successful Withdrawals</h3>
      <ul>
        <li>Keep sufficient balance to cover fees</li>
        <li>Use verified external wallet addresses</li>
        <li>Complete account verification for higher limits</li>
        <li>Submit withdrawals during business days for faster processing</li>
        <li>Monitor your withdrawal history regularly</li>
      </ul>
      
      <p>For withdrawal-related questions, contact Novunt support through the Novunt Assistant.</p>
    `,
  },
  {
    id: 'p2p-transfers',
    title: 'P2P Transfers',
    description:
      'Send USDT to other Novunt users instantly. Learn about transfers, limits, fees (free!), and security.',
    category: 'wallets-finance',
    readTime: 6,
    tags: ['Transfer', 'P2P', 'Security'],
    content: `
      <h2>Peer-to-Peer (P2P) Transfers</h2>
      <p>Novunt allows you to send USDT directly to other Novunt users instantly, free of charge. This feature makes it easy to send funds to friends, family, or business partners within the platform.</p>
      
      <h3>What are P2P Transfers?</h3>
      <p>P2P transfers enable you to send USDT from your Earnings Wallet to another Novunt user's account instantly, without blockchain network fees or delays.</p>
      
      <h3>How to Send a P2P Transfer</h3>
      <ol>
        <li><strong>Go to Wallets:</strong> Navigate to the Wallets section</li>
        <li><strong>Click Transfer:</strong> Select the "Transfer" or "Send" button</li>
        <li><strong>Choose Source Wallet:</strong> Select Earnings Wallet</li>
        <li><strong>2FA Verification:</strong> Two-factor authentication (2FA) is required to complete transfers</li>
        <li><strong>Enter Recipient:</strong> Enter the recipient's email address or user ID</li>
        <li><strong>Enter Amount:</strong> Specify the amount of USDT to send</li>
        <li><strong>Add Note (Optional):</strong> Include a message for the recipient</li>
        <li><strong>Review & Confirm:</strong> Double-check all details and confirm</li>
        <li><strong>Instant Transfer:</strong> Funds are transferred instantly!</li>
      </ol>
      
      <h3>Benefits of P2P Transfers</h3>
      <ul>
        <li><strong>Free:</strong> No transaction fees for P2P transfers</li>
        <li><strong>Instant:</strong> Transfers complete immediately</li>
        <li><strong>Secure:</strong> All transfers are recorded and secure</li>
        <li><strong>Convenient:</strong> Easy way to send funds within the platform</li>
        <li><strong>No Network Fees:</strong> No blockchain fees or waiting times</li>
      </ul>
      
      <h3>Transfer Limits</h3>
      <p>P2P transfers may have limits based on:</p>
      <ul>
        <li><strong>Account Verification:</strong> Higher limits for verified accounts</li>
        <li><strong>Daily Limit:</strong> Maximum amount per day</li>
        <li><strong>Single Transaction:</strong> Maximum per transfer</li>
        <li><strong>Minimum Amount:</strong> Smallest transferable amount</li>
      </ul>
      <p>Check your account dashboard for current limits.</p>
      
      <h3>Security Features</h3>
      <ul>
        <li><strong>User Verification:</strong> Recipient must be a registered Novunt user</li>
        <li><strong>Transaction History:</strong> All transfers are recorded</li>
        <li><strong>Fraud Protection:</strong> Platform monitors for suspicious activity</li>
        <li><strong>Account Validation:</strong> System verifies recipient accounts</li>
      </ul>
      
      <h3>Receiving P2P Transfers</h3>
      <p>When someone sends you a P2P transfer:</p>
      <ul>
        <li>You'll receive a notification (email and/or in-app)</li>
        <li>Funds appear in the wallet specified by the sender</li>
        <li>Transaction appears in your transaction history</li>
        <li>You can view the sender's details and any message included</li>
      </ul>
      
      <h3>Transfer History</h3>
      <p>You can view all P2P transfers:</p>
      <ul>
        <li>In the Wallets section under transaction history</li>
        <li>Filter by sent or received transfers</li>
        <li>View details including date, amount, and recipient/sender</li>
        <li>Export transaction history if needed</li>
      </ul>
      
      <h3>Best Practices</h3>
      <ul>
        <li><strong>Verify Recipient:</strong> Double-check the recipient's email or user ID</li>
        <li><strong>Start Small:</strong> For first-time transfers, send a small test amount</li>
        <li><strong>Add Notes:</strong> Include messages to clarify transfer purpose</li>
        <li><strong>Keep Records:</strong> Save confirmation details for your records</li>
        <li><strong>Check Limits:</strong> Ensure you're within daily and per-transaction limits</li>
      </ul>
      
      <h3>Common Questions</h3>
      <h4>Can I cancel a transfer?</h4>
      <p>P2P transfers are instant and cannot be cancelled once confirmed. Always verify recipient details before sending.</p>
      
      <h4>What if I send to the wrong user?</h4>
      <p>Contact Novunt support immediately if you've sent funds to the wrong recipient. Recovery depends on the specific circumstances.</p>
      
      <h4>Are transfers reversible?</h4>
      <p>P2P transfers are final once confirmed. Ensure accuracy before completing the transfer.</p>
      
      <h3>Use Cases</h3>
      <ul>
        <li>Sending funds to family members on Novunt</li>
        <li>Paying for services within the Novunt community</li>
        <li>Distributing earnings to team members</li>
        <li>Quick transfers without blockchain fees</li>
      </ul>
      
      <p>For questions about P2P transfers, contact Novunt support through the Novunt Assistant.</p>
    `,
  },
  // Staking & Goals
  {
    id: 'goal-based-staking',
    title: 'Goal-Based Staking System',
    description:
      'Create financial goals, choose categories, track progress from 100% to 200%, and manage multiple goals.',
    category: 'staking-goals',
    readTime: 12,
    tags: ['Staking', 'Goals', 'Progress'],
    content: `
      <h2>Goal-Based Staking System</h2>
      <p>Novunt's goal-based staking system allows you to create personalized financial goals and track your progress from 100% to 200% returns. This unique approach helps you visualize and achieve your financial objectives.</p>
      
      <h3>What is Goal-Based Staking?</h3>
      <p>Instead of generic staking, Novunt lets you create meaningful goals with specific purposes. Each goal represents a financial target you want to achieve, whether it's saving for a vacation, building an emergency fund, or staking for growth.</p>
      
      <h3>Creating a Goal</h3>
      <ol>
        <li><strong>Go to Stakes:</strong> Navigate to the Stakes section</li>
        <li><strong>Create New Goal:</strong> Click "Create New Goal" or "New Stake"</li>
        <li><strong>Choose Category:</strong> Select a goal category:
          <ul>
            <li>Emergency Fund</li>
            <li>Vacation</li>
            <li>Staking</li>
            <li>Education</li>
            <li>Home</li>
            <li>Business</li>
            <li>Other</li>
          </ul>
        </li>
        <li><strong>Set Target Amount:</strong> Define how much you want to achieve</li>
        <li><strong>Select Stake Amount:</strong> Choose how much from your Deposit Wallet to stake</li>
        <li><strong>2FA Verification (if $500+):</strong> If staking $500 or more, two-factor authentication (2FA) is required</li>
        <li><strong>Review & Confirm:</strong> Review all details and create your goal</li>
      </ol>
      
      <h3>Progress Tracking (100% to 200%)</h3>
      <p>Your goal progress is tracked as a percentage:</p>
      <ul>
        <li><strong>100%:</strong> Your initial stake amount (starting point)</li>
        <li><strong>100-150%:</strong> Early progress phase</li>
        <li><strong>150-180%:</strong> Mid progress phase</li>
        <li><strong>180-200%:</strong> Approaching completion</li>
        <li><strong>200%:</strong> Goal completed! You've doubled your stake</li>
      </ul>
      <p>Progress increases daily as you earn returns on your stake.</p>
      
      <h3>How Goals Earn Returns</h3>
      <ul>
        <li><strong>Daily Returns (ROS):</strong> Each goal earns daily profit distribution</li>
        <li><strong>Compound Growth:</strong> Earnings accumulate and contribute to progress</li>
        <li><strong>Automatic Tracking:</strong> Progress updates automatically each day</li>
        <li><strong>Visual Progress:</strong> See your goal's progress bar and percentage</li>
      </ul>
      
      <h3>Managing Multiple Goals</h3>
      <p>You can create and manage multiple goals simultaneously:</p>
      <ul>
        <li><strong>Multiple Categories:</strong> Create goals in different categories</li>
        <li><strong>Different Amounts:</strong> Set varying target amounts for each goal</li>
        <li><strong>Priority Management:</strong> Focus on goals that matter most to you</li>
        <li><strong>Individual Tracking:</strong> Each goal tracks its own progress independently</li>
      </ul>
      
      <h3>Goal Categories Explained</h3>
      <ul>
        <li><strong>Emergency Fund:</strong> Safety net for unexpected expenses</li>
        <li><strong>Vacation:</strong> Save for your dream trip</li>
        <li><strong>Staking:</strong> Build wealth over time through staking</li>
        <li><strong>Education:</strong> Fund education expenses</li>
        <li><strong>Home:</strong> Save for home-related expenses</li>
        <li><strong>Business:</strong> Fund business ventures</li>
        <li><strong>Other:</strong> Custom goals for any purpose</li>
      </ul>
      
      <h3>Goal States</h3>
      <ul>
        <li><strong>Active:</strong> Goal is earning returns and progressing</li>
        <li><strong>Completed:</strong> Goal reached 200% (can be withdrawn or used to create new stakes)</li>
        <li><strong>Cancelled:</strong> Goal was cancelled (if applicable)</li>
      </ul>
      
      <h3>Completing a Goal</h3>
      <p>When your goal reaches 200% progress:</p>
      <ul>
        <li>You've doubled your initial stake amount</li>
        <li>Total value = Initial stake + 100% returns</li>
        <li>You can withdraw the full amount</li>
        <li>Or create a new goal with the proceeds</li>
        <li>Celebrate your achievement!</li>
      </ul>
      
      <h3>Staking Requirements</h3>
      <ul>
        <li><strong>2FA for Large Stakes:</strong> Two-factor authentication (2FA) may be required for high-value stakes to protect your account</li>
        <li><strong>Enable 2FA:</strong> Make sure 2FA is enabled in your account settings before creating large stakes</li>
        <li><strong>Security:</strong> This requirement helps protect your account and larger stake amounts</li>
      </ul>
      
      <h3>Best Practices</h3>
      <ul>
        <li><strong>Set Realistic Goals:</strong> Consider your timeline and risk tolerance</li>
        <li><strong>Diversify:</strong> Create multiple goals in different categories</li>
        <li><strong>Regular Monitoring:</strong> Check your goals' progress regularly</li>
        <li><strong>Create New Stakes from Completed Goals:</strong> Consider creating new stakes with completed goal proceeds</li>
        <li><strong>Plan Ahead:</strong> Set goals for future financial needs</li>
        <li><strong>Enable 2FA:</strong> Enable 2FA before creating large stakes to avoid delays</li>
      </ul>
      
      <h3>Tips for Success</h3>
      <ul>
        <li>Start with smaller goals to understand the system</li>
        <li>Use meaningful category names to stay motivated</li>
        <li>Track your overall portfolio progress across all goals</li>
        <li>Review and adjust goals as your situation changes</li>
        <li>Celebrate milestones along the way (150%, 180%, etc.)</li>
      </ul>
      
      <h3>Understanding Returns</h3>
      <p>Goal returns are based on:</p>
      <ul>
        <li>Daily profit distribution (ROS percentage)</li>
        <li>Stake duration and completion status</li>
        <li>Platform performance and profitability</li>
        <li>Your account rank and pool qualifications</li>
      </ul>
      
      <p>For detailed information about returns, see the "Daily Profit Distribution (ROS)" article.</p>
      
      <p>Ready to create your first goal? Navigate to the Stakes section and start building your financial future!</p>
    `,
  },
  {
    id: 'daily-profit-distribution',
    title: 'Daily Profit Distribution (ROS)',
    description:
      'How daily returns work, profit percentages, cool-down periods, maximum caps, and tracking your earnings.',
    category: 'staking-goals',
    readTime: 10,
    tags: ['ROS', 'Earnings', 'Daily Returns'],
    content: `
      <h2>Daily Profit Distribution (ROS)</h2>
      <p>ROS (Return on Stake) is Novunt's daily profit distribution system. This article explains how you earn daily returns on your stakes, how percentages work, and how to track your earnings.</p>
      
      <h3>What is ROS?</h3>
      <p>ROS stands for "Return on Stake" - the daily profit distribution you receive on your active stakes. Each day, eligible stakes earn a percentage-based return that accumulates over time.</p>
      
      <h3>How Daily Returns Work</h3>
      <ol>
        <li><strong>Stake Creation:</strong> When you create a stake/goal, it becomes eligible for daily returns</li>
        <li><strong>Daily Calculation:</strong> Each day, your stake earns a percentage of its current value</li>
        <li><strong>Distribution:</strong> Profits are calculated and added to your Earnings Wallet</li>
        <li><strong>Compound Growth:</strong> Returns accumulate, increasing your total stake value</li>
        <li><strong>Tracking:</strong> You can view daily earnings in your dashboard and transaction history</li>
      </ol>
      
      <h3>Profit Percentages</h3>
      <p>ROS percentages vary based on several factors:</p>
      <ul>
        <li><strong>Stake Type:</strong> Different stake categories may have different rates</li>
        <li><strong>Account Rank:</strong> Higher ranks may earn higher percentages</li>
        <li><strong>Pool Qualification:</strong> Pool members may receive enhanced rates</li>
        <li><strong>Platform Performance:</strong> Rates may adjust based on overall platform profitability</li>
      </ul>
      <p><strong>Note:</strong> ROS percentages are subject to change and are based on platform performance. Check your dashboard for current rates.</p>
      
      <h3>Cool-Down Periods</h3>
      <p>Some stakes may have cool-down periods:</p>
      <ul>
        <li><strong>Definition:</strong> A waiting period before a stake starts earning</li>
        <li><strong>Duration:</strong> Typically 0-7 days depending on stake type</li>
        <li><strong>Purpose:</strong> Ensures platform stability and fair distribution</li>
        <li><strong>During Cool-Down:</strong> Stake doesn't earn returns but counts toward your total staked</li>
      </ul>
      
      <h3>Maximum Caps</h3>
      <p>Some stakes may have maximum earning caps:</p>
      <ul>
        <li><strong>Total Returns Cap:</strong> Maximum total returns a stake can earn</li>
        <li><strong>Daily Cap:</strong> Maximum daily earnings per stake (if applicable)</li>
        <li><strong>Account Cap:</strong> Maximum total daily earnings across all stakes</li>
        <li><strong>Purpose:</strong> Ensures sustainable and fair distribution</li>
      </ul>
      <p>Once a cap is reached, that stake stops earning additional returns.</p>
      
      <h3>When Returns Are Distributed</h3>
      <ul>
        <li><strong>Daily Schedule:</strong> Returns are calculated and distributed daily</li>
        <li><strong>Timing:</strong> Usually processed at a specific time each day</li>
        <li><strong>Automatic:</strong> No action required from you</li>
        <li><strong>Credited to Earnings Wallet:</strong> All ROS earnings go to your Earnings Wallet</li>
      </ul>
      
      <h3>Tracking Your Earnings</h3>
      <p>You can track ROS earnings in multiple ways:</p>
      <ul>
        <li><strong>Dashboard Overview:</strong> See total earnings and today's profit</li>
        <li><strong>Stake Details:</strong> View individual stake earnings and progress</li>
        <li><strong>Transaction History:</strong> See daily ROS entries in your wallet history</li>
        <li><strong>Earnings Wallet:</strong> Monitor accumulating earnings</li>
        <li><strong>Statistics:</strong> View earnings charts and summaries</li>
      </ul>
      
      <h3>Understanding Your Returns</h3>
      <h4>Total Earned (ROS)</h4>
      <p>This shows your lifetime earnings from all ROS distributions across all stakes (regular stakes only, excluding bonus stakes).</p>
      
      <h4>Today's Profit</h4>
      <p>Shows the total ROS earned today across all active stakes.</p>
      
      <h4>Stake Progress</h4>
      <p>Each stake shows its progress from 100% (initial amount) to 200% Accumulated ROS (doubled), with ROS contributing to this growth.</p>
      
      <h3>Factors Affecting ROS</h3>
      <ul>
        <li><strong>Stake Amount:</strong> Larger stakes earn more (but percentage stays the same)</li>
        <li><strong>Stake Duration:</strong> Longer active stakes accumulate more returns</li>
        <li><strong>Account Status:</strong> Rank, verification, and pool membership</li>
        <li><strong>Platform Performance:</strong> Overall profitability affects rates</li>
      </ul>
      
      <h3>Eligibility Requirements</h3>
      <p>For stakes to earn ROS:</p>
      <ul>
        <li>Stake must be active (not completed or cancelled)</li>
        <li>Cool-down period (if any) must have passed</li>
        <li>Maximum cap (if any) must not be reached</li>
        <li>Account must be in good standing</li>
      </ul>
      
      <h3>Withdrawing ROS Earnings</h3>
      <p>Your ROS earnings accumulate in your Earnings Wallet:</p>
      <ul>
        <li>You can withdraw earnings at any time (subject to withdrawal requirements)</li>
        <li>Or transfer earnings to Deposit Wallet to create new stakes</li>
        <li>No need to wait for stake completion to access earnings</li>
      </ul>
      
      <h3>Best Practices</h3>
      <ul>
        <li><strong>Monitor Regularly:</strong> Check your daily earnings and total progress</li>
        <li><strong>Create New Stakes Strategically:</strong> Consider creating new stakes with earnings</li>
        <li><strong>Understand Caps:</strong> Know your stake limits and maximums</li>
        <li><strong>Track Trends:</strong> Monitor how rates change over time</li>
        <li><strong>Diversify:</strong> Spread stakes across different categories and amounts</li>
      </ul>
      
      <h3>Common Questions</h3>
      <h4>Why didn't I earn ROS today?</h4>
      <p>Possible reasons: stake is in cool-down, maximum cap reached, stake completed, or account issues. Check your stake status and contact support if needed.</p>
      
      <h4>Can ROS rates change?</h4>
      <p>Yes, rates may adjust based on platform performance, but changes are typically gradual and communicated to users.</p>
      
      <h4>Do I earn ROS on bonus stakes?</h4>
      <p>Bonus stakes may have different earning structures. Check individual stake details for specific information.</p>
      
      <p>For detailed ROS information specific to your account, check your dashboard or contact Novunt support through the Novunt Assistant.</p>
    `,
  },
  // Earning Systems
  {
    id: 'three-tier-pool-system',
    title: 'Three-Tier Pool System',
    description:
      'Stake Pool (everyone), Performance Pool (ranked), and Premium Pool (leadership). How to qualify and maximize earnings.',
    category: 'earning-systems',
    readTime: 15,
    tags: ['Pools', 'Earnings', 'Ranking'],
    content: `
      <h2>Pool System</h2>
      <p>Novunt features a pool system that provides additional earning opportunities beyond regular staking. Pool distributions are based on your rank and team-building efforts, with higher ranks qualifying for larger pool shares.</p>
      
      <h3>Overview of Pool System</h3>
      <p>The pool system distributes additional profits to qualified members based on their rank and team performance. There are two main pool types:</p>
      <ul>
        <li><strong>Performance Pool:</strong> Distributions based on rank qualifications</li>
        <li><strong>Premium Pool:</strong> Additional distributions for qualified members</li>
      </ul>
      <p>Pool distributions are organized by rank, with each rank having specific qualification requirements and earning potential. Both Performance Pool and Premium Pool offer earnings opportunities for qualified members.</p>
      
      <h3>The Rank-Based Pool Structure</h3>
      <p>Pools are organized by rank levels. As you progress through ranks, you qualify for higher-tier pool distributions:</p>
      
      <h4>1. Stakeholder Pool</h4>
      <p><strong>Who Qualifies?</strong></p>
      <ul>
        <li>All users start at the Stakeholder rank</li>
        <li>Minimum personal stake requirement: $20</li>
        <li>Basic participation in pool distributions</li>
      </ul>
      <p><strong>Benefits:</strong></p>
      <ul>
        <li>Access to basic pool distributions</li>
        <li>Earn from Performance Pool and Premium Pool</li>
        <li>Foundation for rank progression</li>
      </ul>
      
      <h4>2. Associate Stakeholder Pool</h4>
      <p><strong>Who Qualifies?</strong></p>
      <ul>
        <li>Personal stake: $50 minimum</li>
        <li>Team stake: $5,000 minimum</li>
        <li>Direct downlines: 5 minimum</li>
        <li>Rank bonus: 15%</li>
      </ul>
      <p><strong>Benefits:</strong></p>
      <ul>
        <li>Higher pool distribution amounts</li>
        <li>Enhanced earning potential</li>
        <li>Better share of pool profits</li>
        <li>Rank bonus percentage applied</li>
      </ul>
      
      <h4>3. Principal Strategist Pool</h4>
      <p><strong>Who Qualifies?</strong></p>
      <ul>
        <li>Personal stake: $100 minimum</li>
        <li>Team stake: $10,000 minimum</li>
        <li>Direct downlines: 10 minimum</li>
        <li>Lower rank requirement: 2 Associate Stakeholders in your team</li>
        <li>Rank bonus: 17.5%</li>
      </ul>
      <p><strong>Benefits:</strong></p>
      <ul>
        <li>Significantly higher pool distributions</li>
        <li>Leadership recognition</li>
        <li>Enhanced team-building rewards</li>
        <li>Higher rank bonus percentage</li>
      </ul>
      
      <h4>4. Elite Capitalist Pool</h4>
      <p><strong>Who Qualifies?</strong></p>
      <ul>
        <li>Personal stake: $250 minimum</li>
        <li>Team stake: $25,000 minimum</li>
        <li>Direct downlines: 15 minimum</li>
        <li>Lower rank requirement: 2 Principal Strategists in your team</li>
        <li>Rank bonus: 20%</li>
      </ul>
      <p><strong>Benefits:</strong></p>
      <ul>
        <li>Premium pool distribution amounts</li>
        <li>Elite status recognition</li>
        <li>Maximum earning potential at this level</li>
        <li>Higher rank bonus percentage</li>
      </ul>
      
      <h4>5. Wealth Architect Pool</h4>
      <p><strong>Who Qualifies?</strong></p>
      <ul>
        <li>Personal stake: $500 minimum</li>
        <li>Team stake: $50,000 minimum</li>
        <li>Direct downlines: 20 minimum</li>
        <li>Lower rank requirement: 2 Elite Capitalists in your team</li>
        <li>Rank bonus: 22.5%</li>
      </ul>
      <p><strong>Benefits:</strong></p>
      <ul>
        <li>Top-tier pool distributions</li>
        <li>Wealth Architect recognition</li>
        <li>Exclusive earning opportunities</li>
        <li>Highest rank bonus percentage at this level</li>
      </ul>
      
      <h4>6. Finance Titan Pool (Highest Tier)</h4>
      <p><strong>Who Qualifies?</strong></p>
      <ul>
        <li>Personal stake: $1,000 minimum</li>
        <li>Team stake: $100,000 minimum</li>
        <li>Direct downlines: 25 minimum</li>
        <li>Lower rank requirement: 2 Wealth Architects in your team</li>
        <li>Rank bonus: 25%</li>
      </ul>
      <p><strong>Benefits:</strong></p>
      <ul>
        <li>Maximum pool distribution amounts</li>
        <li>Finance Titan elite status</li>
        <li>Highest possible earning potential</li>
        <li>Maximum rank bonus percentage</li>
        <li>Exclusive privileges and recognition</li>
      </ul>
      
      <h3>How Pool Qualifications Work</h3>
      <p>To qualify for a pool at your rank level, you must meet:</p>
      <ul>
        <li><strong>Personal Stake Requirement:</strong> Minimum amount you've staked personally</li>
        <li><strong>Team Stake Requirement:</strong> Total staked amount across your entire referral network</li>
        <li><strong>Direct Downlines:</strong> Number of people you directly referred</li>
        <li><strong>Lower Rank Requirement:</strong> Number of downlines at specific lower ranks (for higher ranks)</li>
        <li><strong>Ongoing Activity:</strong> Maintain active participation</li>
      </ul>
      
      <h3>Pool Distributions</h3>
      <h4>How Distributions Work</h4>
      <ul>
        <li><strong>Frequency:</strong> Distributions occur at regular intervals (check platform for schedule)</li>
        <li><strong>Calculation:</strong> Based on pool tier, qualification level, and contribution</li>
        <li><strong>Credited To:</strong> Funds go directly to your Earnings Wallet</li>
        <li><strong>Transparency:</strong> View distribution history and amounts in the Pools section</li>
      </ul>
      
      <h4>Distribution Amounts</h4>
      <ul>
        <li>Amounts vary based on pool tier and qualification level</li>
        <li>Higher tiers receive larger distributions</li>
        <li>Performance and team metrics affect amounts</li>
        <li>Total pool size determines individual shares</li>
      </ul>
      
      <h3>Tracking Pool Progress</h3>
      <p>You can monitor your pool qualifications and progress:</p>
      <ul>
        <li><strong>Pools Section:</strong> View qualification requirements and progress</li>
        <li><strong>Progress Bars:</strong> See how close you are to qualifying</li>
        <li><strong>Requirements List:</strong> Check what you need to achieve</li>
        <li><strong>Distribution History:</strong> View past pool earnings</li>
        <li><strong>Team Metrics:</strong> Track your team-building progress</li>
      </ul>
      
      <h3>Rank Bonus Percentages</h3>
      <p>Each rank includes a rank bonus percentage that enhances your pool earnings:</p>
      <ul>
        <li><strong>Stakeholder:</strong> 0% (entry level)</li>
        <li><strong>Associate Stakeholder:</strong> 15%</li>
        <li><strong>Principal Strategist:</strong> 17.5%</li>
        <li><strong>Elite Capitalist:</strong> 20%</li>
        <li><strong>Wealth Architect:</strong> 22.5%</li>
        <li><strong>Finance Titan:</strong> 25%</li>
      </ul>
      <p>Higher rank bonus percentages mean larger shares of pool distributions.</p>
      
      <h3>Maximizing Pool Earnings</h3>
      <ul>
        <li><strong>Rank Up Systematically:</strong> Progress through ranks to unlock higher pool tiers</li>
        <li><strong>Build Your Team:</strong> Focus on referrals to meet team stake and downline requirements</li>
        <li><strong>Help Downlines Rank Up:</strong> Support your team to reach higher ranks (required for higher tiers)</li>
        <li><strong>Maintain Stake Levels:</strong> Keep personal and team stakes above minimum requirements</li>
        <li><strong>Stay Active:</strong> Consistent platform activity maintains qualification</li>
        <li><strong>Monitor Progress:</strong> Regularly check qualification status in the Pools section</li>
      </ul>
      
      <h3>Pool vs. Regular Staking</h3>
      <p>Pool earnings are <strong>in addition to</strong> regular ROS earnings:</p>
      <ul>
        <li><strong>ROS:</strong> Daily returns on your stakes (everyone earns this)</li>
        <li><strong>Pool Distributions:</strong> Additional periodic earnings based on rank qualification</li>
        <li><strong>Rank Bonus:</strong> Percentage bonus applied to pool distributions based on your rank</li>
        <li>All earnings accumulate in your Earnings Wallet</li>
        <li>Pool earnings complement, not replace, ROS</li>
      </ul>
      
      <h3>Common Questions</h3>
      <h4>Do I need to maintain qualifications to keep receiving distributions?</h4>
      <p>Yes, you must maintain all qualification requirements (personal stake, team stake, downlines, etc.) to continue receiving pool distributions at your rank level.</p>
      
      <h4>What happens if I don't meet requirements anymore?</h4>
      <p>If you fall below qualification requirements, you may lose access to your current rank's pool distributions. Maintain requirements to keep earning.</p>
      
      <h4>How often are pool distributions made?</h4>
      <p>Distribution frequency varies. Check the Pools section or platform announcements for current distribution schedules.</p>
      
      <h4>Can I see my pool qualification progress?</h4>
      <p>Yes! The Pools section shows your current rank, qualification requirements, progress toward next rank, and pool distribution history.</p>
      
      <h3>Getting Started</h3>
      <ol>
        <li>Start staking to begin at the Stakeholder level</li>
        <li>Check the Pools section to see your current rank and requirements</li>
        <li>Work toward Associate Stakeholder by building your team and increasing stakes</li>
        <li>Progress through ranks by meeting increasing requirements</li>
        <li>Help your downlines rank up to qualify for higher tiers</li>
        <li>Monitor your progress and pool distributions regularly</li>
      </ol>
      
      <p>Ready to maximize your pool earnings? Check the Pools section to see your current rank, qualification requirements, and start building toward higher tiers!</p>
    `,
  },
  {
    id: 'referral-bonus-system',
    title: 'Referral Bonus System',
    description:
      '5-level referral program with instant commissions. Learn how to earn from your network and maximize referral income.',
    category: 'earning-systems',
    readTime: 10,
    tags: ['Referrals', 'Commissions', 'Network'],
    content: `
      <h2>Referral Bonus System</h2>
      <p>Novunt's 5-level referral program allows you to earn commissions from your network's activity. Build a team and earn instant commissions on multiple levels!</p>
      
      <h3>How the Referral Program Works</h3>
      <p>When someone signs up using your referral link or code, they become part of your network. You earn commissions on their activities across 5 levels of your downline.</p>
      
      <h3>Understanding the 5 Levels</h3>
      <p>The referral program tracks 5 levels of referrals:</p>
      <ul>
        <li><strong>Level 1 (Direct Referrals):</strong> People you directly referred - 5%</li>
        <li><strong>Level 2:</strong> Referrals of your Level 1 downlines - 2%</li>
        <li><strong>Level 3:</strong> Referrals of your Level 2 downlines - 1.5%</li>
        <li><strong>Level 4:</strong> Referrals of your Level 3 downlines - 1%</li>
        <li><strong>Level 5:</strong> Referrals of your Level 4 downlines - 0.5%</li>
      </ul>
      <p>You earn commissions on activity from all 5 levels, though commission percentages may decrease at deeper levels.</p>
      
      <h3>What Activities Generate Commissions?</h3>
      <p>You earn commissions when your downlines:</p>
      <ul>
        <li>Create stakes (commission on stake amount)</li>
        <li>Complete specific activities (varies by level)</li>
      </ul>
      <p>Commission rates typically decrease at deeper levels (e.g., Level 1 highest, Level 5 lowest).</p>
      
      <h3>Instant Commissions</h3>
      <p>One of the best features of Novunt's referral system:</p>
      <ul>
        <li><strong>Real-Time Payments:</strong> Commissions are credited instantly when activities occur</li>
        <li><strong>No Waiting:</strong> Funds appear in your Earnings Wallet immediately</li>
        <li><strong>Automatic Processing:</strong> No need to request or claim commissions</li>
        <li><strong>Transparent Tracking:</strong> See every commission in your transaction history</li>
      </ul>
      
      <h3>Getting Your Referral Link & Code</h3>
      <ol>
        <li>Go to the Team section</li>
        <li>Find your unique referral link</li>
        <li>Copy the link or referral code</li>
        <li>Share with friends, family, and your network</li>
        <li>They sign up using your link/code</li>
        <li>They become part of your network automatically</li>
      </ol>
      
      <h3>How to Maximize Referral Income</h3>
      <ul>
        <li><strong>Share Widely:</strong> Share your referral link on social media, email, and messaging</li>
        <li><strong>Educate Referrals:</strong> Help your downlines understand the platform</li>
        <li><strong>Build Deep Networks:</strong> Encourage your downlines to refer others (creates deeper levels)</li>
        <li><strong>Support Your Team:</strong> Help downlines succeed to increase their activity</li>
        <li><strong>Track Performance:</strong> Monitor your referral network's activity regularly</li>
        <li><strong>Rank Up:</strong> Higher ranks may unlock better commission rates</li>
      </ul>
      
      <h3>Viewing Your Referral Network</h3>
      <p>In the Team section, you can:</p>
      <ul>
        <li>See your total number of referrals at each level</li>
        <li>View individual downline details</li>
        <li>Track referral activity and earnings</li>
        <li>Monitor team performance metrics</li>
        <li>See referral tree visualization</li>
        <li>View commission history</li>
      </ul>
      
      <h3>Commission Structure</h3>
      <p>Commission rates vary by:</p>
      <ul>
        <li><strong>Level:</strong> Level 1 typically has the highest rate</li>
        <li><strong>Activity Type:</strong> Different activities may have different rates</li>
        <li><strong>Account Rank:</strong> Higher ranks may earn higher commission percentages</li>
        <li><strong>Platform Policies:</strong> Rates are set by Novunt and may change</li>
      </ul>
      <p>Check your account dashboard or Team section for current commission rates.</p>
      
      <h3>Tracking Commissions</h3>
      <p>You can track referral commissions through:</p>
      <ul>
        <li><strong>Team Dashboard:</strong> Overview of referral earnings</li>
        <li><strong>Transaction History:</strong> Individual commission entries</li>
        <li><strong>Earnings Wallet:</strong> Total accumulated commissions</li>
        <li><strong>Statistics:</strong> Commission breakdown by level and time period</li>
      </ul>
      
      <h3>Best Practices for Referrals</h3>
      <ul>
        <li><strong>Be Genuine:</strong> Only refer people who are genuinely interested</li>
        <li><strong>Provide Value:</strong> Help referrals understand and succeed on the platform</li>
        <li><strong>Stay Active:</strong> Active referrers often build better networks</li>
        <li><strong>Build Relationships:</strong> Support your downlines beyond just referring</li>
        <li><strong>Use Multiple Channels:</strong> Share links across different platforms</li>
        <li><strong>Create Content:</strong> Share your success stories to attract referrals</li>
      </ul>
      
      <h3>Referral vs. Other Earnings</h3>
      <p>Referral commissions are separate from:</p>
      <ul>
        <li><strong>ROS Earnings:</strong> Daily returns on your stakes</li>
        <li><strong>Pool Distributions:</strong> Pool tier earnings</li>
        <li><strong>Registration Bonuses:</strong> One-time welcome bonuses</li>
      </ul>
      <p>All earnings (including referrals) accumulate in your Earnings Wallet.</p>
      
      <h3>Common Questions</h3>
      <h4>Do I need to maintain referrals to keep earning?</h4>
      <p>You earn commissions when your downlines are active. Active referrals generate ongoing commissions.</p>
      
      <h4>What if someone I referred stops using the platform?</h4>
      <p>You only earn commissions on active activities. If they're inactive, you won't earn new commissions from them.</p>
      
      <h4>Can I refer myself with a different account?</h4>
      <p>No, self-referrals or creating multiple accounts for referral purposes violate platform terms and may result in account suspension.</p>
      
      <h4>How do I know if someone used my referral link?</h4>
      <p>They'll appear in your Team section under Level 1 referrals once they've registered and completed initial setup.</p>
      
      <h3>Getting Started</h3>
      <ol>
        <li>Get your referral link from the Team section</li>
        <li>Share it with your network</li>
        <li>Help people sign up and get started</li>
        <li>Support them to become active users</li>
        <li>Watch your commissions grow!</li>
      </ol>
      
      <p>Start building your referral network today and earn passive income from your team's success!</p>
    `,
  },
  {
    id: 'registration-bonus',
    title: 'Registration Bonus',
    description:
      '10% bonus on your first stake. Qualification requirements, bonus states, and how to claim your welcome bonus.',
    category: 'earning-systems',
    readTime: 8,
    tags: ['Bonus', 'New User', 'Welcome'],
    content: `
      <h2>Registration Bonus</h2>
      <p>New Novunt users can earn a 10% bonus on their first stake! This welcome bonus helps you get started with extra value on your initial stake.</p>
      
      <h3>What is the Registration Bonus?</h3>
      <p>The registration bonus is a 10% bonus on your first stake amount. When you create your first stake, the bonus is automatically created as a separate, independent stake. For example, if you stake $1,000, you'll receive a $100 bonus stake created separately.</p>
      
      <h3>How It Works</h3>
      <ol>
        <li>You register a new Novunt account</li>
        <li>Complete required profile setup</li>
        <li>Create your first stake/goal (e.g., $1,000)</li>
        <li>The 10% bonus is automatically created as a separate stake (e.g., $100)</li>
        <li>Both stakes earn daily ROS independently</li>
        <li>Your original stake can earn up to 200% (doubles to $2,000)</li>
        <li>The bonus stake earns 100% of the bonus amount</li>
      </ol>
      
      <h3>Qualification Requirements</h3>
      <p>To qualify for the registration bonus, you typically need to:</p>
      <ul>
        <li><strong>Be a New User:</strong> First-time account registration</li>
        <li><strong>Complete Profile:</strong> Finish profile setup and verification</li>
        <li><strong>First Stake Only:</strong> Bonus applies only to your first stake</li>
        <li><strong>Minimum Stake:</strong> May require a minimum stake amount</li>
        <li><strong>Within Timeframe:</strong> Create first stake within a specified period</li>
      </ul>
      
      <h3>Bonus States</h3>
      <p>Your registration bonus stake goes through different states:</p>
      <ul>
        <li><strong>Pending:</strong> Bonus is eligible but first stake not yet created</li>
        <li><strong>Active:</strong> Bonus stake is created and earning daily ROS</li>
        <li><strong>Earning:</strong> Bonus stake earns returns based on declared daily ROS</li>
        <li><strong>Completed:</strong> Bonus stake reaches 200% (doubles to $200 in the example)</li>
      </ul>
      
      <h3>How to Claim Your Bonus</h3>
      <ol>
        <li><strong>Register:</strong> Create your Novunt account</li>
        <li><strong>Complete Profile:</strong> Fill out your profile information</li>
        <li><strong>Verify Account:</strong> Complete any required verification steps</li>
        <li><strong>Make First Deposit:</strong> Deposit USDT to your Deposit Wallet</li>
        <li><strong>Create First Stake:</strong> Create your first stake/goal</li>
        <li><strong>Bonus Applied:</strong> The 10% bonus is automatically added!</li>
      </ol>
      
      <h3>Understanding the Bonus</h3>
      <h4>Bonus Calculation</h4>
      <p>Example: If you create your first stake of $1,000:</p>
      <ul>
        <li>Your original stake amount: $1,000</li>
        <li>Registration bonus (10%): $100</li>
        <li>The $100 bonus is created as a separate, independent stake</li>
        <li>You now have two stakes: your original $1,000 stake and a $100 bonus stake</li>
      </ul>
      
      <h4>How Both Stakes Earn</h4>
      <p>Both stakes earn daily ROS independently:</p>
      <ul>
        <li><strong>Original Stake ($1,000):</strong> Earns daily ROS and can progress from 100% to 200% (can double to $2,000)</li>
        <li><strong>Bonus Stake ($100):</strong> Earns daily ROS and can progress from 100% to 200% (can double to $200)</li>
        <li>Both stakes earn returns based on the declared daily ROS percentage</li>
        <li>Each stake tracks its own progress independently</li>
        <li>The bonus stake is a separate stake with its own completion target</li>
      </ul>
      
      <h4>Important Difference</h4>
      <p>The key difference is the completion target:</p>
      <ul>
        <li><strong>Regular Stakes (including your first stake):</strong> Can earn up to 200% (progress from 100% to 200%, doubling the stake amount)</li>
        <li><strong>Bonus Stake:</strong> Can only earn up to 100% (progresses from 100% to 200%, but the earnings are limited to 100% of the bonus amount)</li>
        <li>Both stakes earn daily ROS based on the declared percentage</li>
        <li>Both stakes appear separately in your stakes list</li>
        <li>The bonus stake is a separate stake that operates independently</li>
      </ul>
      
      <h4>Example Breakdown</h4>
      <p>If you stake $1,000 as your first stake:</p>
      <ul>
        <li><strong>Your Original Stake:</strong> $1,000 - can progress to 200% ($2,000 total)</li>
        <li><strong>Bonus Stake Created:</strong> $100 - can progress to 200% ($200 total, earning 100% profit)</li>
        <li>Both stakes earn daily ROS independently</li>
        <li>Both stakes track their own progress separately</li>
      </ul>
      
      <h3>Bonus Conditions & Restrictions</h3>
      <ul>
        <li><strong>One-Time Only:</strong> Bonus applies only to your first stake</li>
        <li><strong>New Accounts Only:</strong> Existing users don't qualify</li>
        <li><strong>Minimum Stake:</strong> May require minimum stake amount to qualify</li>
        <li><strong>Time Limit:</strong> Must create first stake within specified timeframe</li>
        <li><strong>Account Status:</strong> Account must be in good standing</li>
      </ul>
      
      <h3>Bonus Withdrawal</h3>
      <p>Depending on platform policies:</p>
      <ul>
        <li>Bonus may be locked until stake completion</li>
        <li>Or may be available for withdrawal after a certain period</li>
        <li>Check bonus terms and conditions for specific rules</li>
        <li>Earnings from bonus (ROS) are typically withdrawable immediately</li>
      </ul>
      
      <h3>Tracking Your Bonus</h3>
      <p>You can monitor your registration bonus:</p>
      <ul>
        <li><strong>Dashboard:</strong> View bonus status and amount</li>
        <li><strong>Stake Details:</strong> See your original stake and the separate bonus stake</li>
        <li><strong>Transaction History:</strong> View bonus credit entry</li>
        <li><strong>Account Settings:</strong> Check bonus eligibility and status</li>
      </ul>
      
      <h3>Tips for Maximizing Your Bonus</h3>
      <ul>
        <li><strong>Stake Maximum:</strong> Consider staking a larger amount to maximize bonus stake value (10% of larger amount = larger bonus stake)</li>
        <li><strong>Complete Profile:</strong> Finish all profile requirements early</li>
        <li><strong>Act Quickly:</strong> Create first stake within the qualification period</li>
        <li><strong>Understand Terms:</strong> Read bonus terms to know all conditions</li>
        <li><strong>Track Progress:</strong> Monitor bonus status and stake performance</li>
      </ul>
      
      <h3>Common Questions</h3>
      <h4>What if I don't create a stake right away?</h4>
      <p>You typically have a limited time window to create your first stake and claim the bonus. Check the terms for the specific timeframe.</p>
      
      <h4>Can I get the bonus on multiple stakes?</h4>
      <p>No, the registration bonus applies only to your first stake. Subsequent stakes don't receive this bonus.</p>
      
      <h4>What happens if I cancel my first stake?</h4>
      <p>Bonuses may be forfeited if the qualifying stake is cancelled. Check terms for specific policies.</p>
      
      <h4>Do I need to complete profile verification?</h4>
      <p>Profile completion is typically required to qualify for the bonus. Complete all required steps.</p>
      
      <h3>Next Steps After Bonus</h3>
      <p>Once you've claimed your registration bonus:</p>
      <ol>
        <li>Continue building your portfolio with additional stakes</li>
        <li>Explore other earning opportunities (referrals, pools, achievements)</li>
        <li>Rank up to unlock additional benefits</li>
        <li>Build your referral network</li>
        <li>Maximize your earning potential</li>
      </ol>
      
      <p>Don't miss out on this welcome bonus! Complete your profile and create your first stake to claim your 10% registration bonus today!</p>
    `,
  },
  {
    id: 'achievement-system-nxp',
    title: 'Achievement System & NXP',
    description:
      'Earn badges and Novunt Experience Points (NXP) for accomplishments. Level up and showcase your achievements.',
    category: 'earning-systems',
    readTime: 12,
    tags: ['Achievements', 'Badges', 'NXP'],
    content: `
      <h2>Achievement System & NXP</h2>
      <p>Novunt's Achievement System rewards you for platform activities and milestones. Earn badges, collect Novunt Experience Points (NXP), and level up as you progress!</p>
      
      <h3>What are Achievements?</h3>
      <p>Achievements are milestones and accomplishments you unlock as you use the Novunt platform. Each achievement comes with:</p>
      <ul>
        <li><strong>Badges:</strong> Visual icons representing your accomplishments</li>
        <li><strong>NXP Points:</strong> Novunt Experience Points awarded for each achievement</li>
        <li><strong>Recognition:</strong> Showcase your progress and success</li>
        <li><strong>Potential Rewards:</strong> Some achievements may include bonus rewards</li>
      </ul>
      
      <h3>What is NXP?</h3>
      <p>NXP (Novunt Experience Points) is a points system that tracks your overall platform engagement and success:</p>
      <ul>
        <li><strong>Earned from Achievements:</strong> Complete achievements to earn NXP</li>
        <li><strong>Cumulative:</strong> NXP accumulates as you progress</li>
        <li><strong>Level System:</strong> Higher NXP levels unlock benefits</li>
        <li><strong>Profile Display:</strong> Your NXP level is visible on your profile</li>
      </ul>
      
      <h3>Types of Achievements</h3>
      <h4>Staking Achievements</h4>
      <ul>
        <li>First stake created</li>
        <li>Total staked milestones ($100, $500, $1,000, etc.)</li>
        <li>Stake completion achievements</li>
        <li>Multiple goals created</li>
        <li>Long-term staking streaks</li>
      </ul>
      
      <h4>Earning Achievements</h4>
      <ul>
        <li>First earnings milestone</li>
        <li>Total earnings milestones</li>
        <li>Daily profit milestones</li>
        <li>Withdrawal achievements</li>
      </ul>
      
      <h4>Team Building Achievements</h4>
      <ul>
        <li>First referral</li>
        <li>Referral count milestones</li>
        <li>Team size achievements</li>
        <li>Network depth achievements</li>
      </ul>
      
      <h4>Rank & Progression Achievements</h4>
      <ul>
        <li>Rank-up achievements (Bronze, Silver, Gold, etc.)</li>
        <li>Rank maintenance milestones</li>
        <li>Pool qualification achievements</li>
      </ul>
      
      <h4>Engagement Achievements</h4>
      <ul>
        <li>Profile completion</li>
        <li>Social media verification</li>
        <li>Login streaks</li>
        <li>Platform activity milestones</li>
      </ul>
      
      <h3>How to Earn Achievements</h3>
      <ol>
        <li><strong>Use the Platform:</strong> Normal platform activities unlock achievements automatically</li>
        <li><strong>Complete Milestones:</strong> Reach specific thresholds (amounts, counts, durations)</li>
        <li><strong>Check Progress:</strong> View achievement progress in the Achievements section</li>
        <li><strong>Earn NXP:</strong> Each achievement awards NXP points</li>
        <li><strong>Level Up:</strong> Accumulate NXP to level up</li>
      </ol>
      
      <h3>Viewing Your Achievements</h3>
      <p>You can view achievements in the Achievements section:</p>
      <ul>
        <li><strong>Completed:</strong> Achievements you've unlocked</li>
        <li><strong>In Progress:</strong> Achievements you're working toward</li>
        <li><strong>Locked:</strong> Achievements not yet started</li>
        <li><strong>Progress Bars:</strong> See how close you are to completing achievements</li>
        <li><strong>NXP Summary:</strong> View total NXP earned and current level</li>
      </ul>
      
      <h3>NXP Level System</h3>
      <p>As you earn NXP, you progress through levels:</p>
      <ul>
        <li><strong>Level 1-10:</strong> Beginner levels</li>
        <li><strong>Level 11-25:</strong> Intermediate levels</li>
        <li><strong>Level 26-50:</strong> Advanced levels</li>
        <li><strong>Level 51+:</strong> Expert and Master levels</li>
      </ul>
      <p>Higher levels may unlock:</p>
      <ul>
        <li>Exclusive badges and rewards</li>
        <li>Enhanced earning rates</li>
        <li>Special recognition</li>
        <li>Platform privileges</li>
      </ul>
      
      <h3>Badge Categories</h3>
      <p>Badges are organized into categories:</p>
      <ul>
        <li><strong>Staking Badges:</strong> Related to staking activities</li>
        <li><strong>Earning Badges:</strong> Related to earnings and profits</li>
        <li><strong>Team Badges:</strong> Related to referrals and network building</li>
        <li><strong>Rank Badges:</strong> Related to rank progression</li>
        <li><strong>Special Badges:</strong> Rare or event-based achievements</li>
      </ul>
      
      <h3>Benefits of Achievements</h3>
      <ul>
        <li><strong>Gamification:</strong> Makes platform usage more engaging and fun</li>
        <li><strong>Goals:</strong> Provides clear objectives to work toward</li>
        <li><strong>Recognition:</strong> Showcases your success and progress</li>
        <li><strong>Rewards:</strong> May include bonus rewards or benefits</li>
        <li><strong>Motivation:</strong> Encourages continued platform engagement</li>
        <li><strong>Social Proof:</strong> Demonstrates your commitment and success</li>
      </ul>
      
      <h3>Maximizing Your Achievements</h3>
      <ul>
        <li><strong>Review Available Achievements:</strong> Know what's possible to unlock</li>
        <li><strong>Focus on Progress:</strong> Work toward achievements you're close to completing</li>
        <li><strong>Diversify Activities:</strong> Engage in different platform features</li>
        <li><strong>Set Goals:</strong> Use achievements as motivation for specific targets</li>
        <li><strong>Track Progress:</strong> Regularly check your achievement status</li>
        <li><strong>Complete Profile:</strong> Many achievements require profile completion</li>
      </ul>
      
      <h3>Sharing Achievements</h3>
      <p>You can showcase your achievements:</p>
      <ul>
        <li><strong>Profile Display:</strong> Badges appear on your profile</li>
        <li><strong>Social Sharing:</strong> Share major achievements on social media</li>
        <li><strong>Team View:</strong> Your team can see your achievements</li>
        <li><strong>Leaderboards:</strong> Top achievers may appear on leaderboards</li>
      </ul>
      
      <h3>Achievement Notifications</h3>
      <p>When you unlock an achievement:</p>
      <ul>
        <li>You'll receive a notification</li>
        <li>Badge is automatically added to your collection</li>
        <li>NXP is credited to your account</li>
        <li>Achievement appears in your completed list</li>
        <li>Progress updates for related achievements</li>
      </ul>
      
      <h3>Tips for Earning More Achievements</h3>
      <ul>
        <li><strong>Be Consistent:</strong> Regular platform activity unlocks more achievements</li>
        <li><strong>Set Milestones:</strong> Plan to reach specific achievement thresholds</li>
        <li><strong>Explore Features:</strong> Use different platform features to unlock diverse achievements</li>
        <li><strong>Build Your Network:</strong> Referrals unlock team-building achievements</li>
        <li><strong>Rank Up:</strong> Progress through ranks to unlock rank achievements</li>
        <li><strong>Complete All Tasks:</strong> Finish profile, verification, and setup tasks</li>
      </ul>
      
      <h3>Common Questions</h3>
      <h4>Do achievements expire?</h4>
      <p>No, once unlocked, achievements are permanently yours. However, some achievements may require ongoing activity to maintain status.</p>
      
      <h4>Can I lose NXP?</h4>
      <p>NXP is cumulative and typically doesn't decrease. However, check platform policies for any specific rules.</p>
      
      <h4>Are there limited-time achievements?</h4>
      <p>Some special events may feature limited-time achievements. Check platform announcements for special events.</p>
      
      <h3>Getting Started</h3>
      <ol>
        <li>Go to the Achievements section</li>
        <li>Review available achievements</li>
        <li>Check your current progress</li>
        <li>Work toward completing achievements</li>
        <li>Watch your NXP grow!</li>
      </ol>
      
      <p>Start earning achievements today and level up your Novunt experience!</p>
    `,
  },
  // Ranks & Teams
  {
    id: 'rank-system-progression',
    title: 'Rank System & Progression',
    description:
      'Complete guide to all 6 ranks, requirements, progression paths, regression system, and verification badges.',
    category: 'ranks-teams',
    readTime: 15,
    tags: ['Ranks', 'Progression', 'Team Building'],
    content: `
      <h2>Rank System & Progression</h2>
      <p>Novunt's rank system recognizes your platform success and unlocks increasing benefits as you progress. This comprehensive guide covers all 6 ranks, requirements, and how to advance.</p>
      
      <h3>Understanding the Rank System</h3>
      <p>The rank system has 6 levels, each with specific requirements and benefits. Higher ranks unlock better earning opportunities, pool access, and platform privileges.</p>
      
      <h3>The 6 Ranks</h3>
      <h4>1. Starter (Entry Level)</h4>
      <p><strong>Requirements:</strong></p>
      <ul>
        <li>Account registration completed</li>
        <li>Profile setup initiated</li>
      </ul>
      <p><strong>Benefits:</strong></p>
      <ul>
        <li>Access to basic platform features</li>
        <li>Can create stakes and earn ROS</li>
        <li>Participate in Stake Pool</li>
        <li>Earn referral commissions</li>
      </ul>
      
      <h4>2. Bronze</h4>
      <p><strong>Requirements:</strong></p>
      <ul>
        <li>Profile completion</li>
        <li>Minimum total staked amount</li>
        <li>Account verification</li>
      </ul>
      <p><strong>Benefits:</strong></p>
      <ul>
        <li>All Starter benefits</li>
        <li>Enhanced ROS rates (potentially)</li>
        <li>Better referral commission rates</li>
        <li>Access to more features</li>
      </ul>
      
      <h4>3. Silver</h4>
      <p><strong>Requirements:</strong></p>
      <ul>
        <li>Higher total staked amount</li>
        <li>Minimum number of direct referrals</li>
        <li>Team building activity</li>
        <li>Profile completion and verification</li>
      </ul>
      <p><strong>Benefits:</strong></p>
      <ul>
        <li>All Bronze benefits</li>
        <li>Performance Pool qualification eligibility</li>
        <li>Higher earning rates</li>
        <li>Enhanced pool distributions</li>
      </ul>
      
      <h4>4. Gold</h4>
      <p><strong>Requirements:</strong></p>
      <ul>
        <li>Significant total staked amount</li>
        <li>Multiple direct downlines</li>
        <li>Team depth requirements</li>
        <li>Consistent platform activity</li>
      </ul>
      <p><strong>Benefits:</strong></p>
      <ul>
        <li>All Silver benefits</li>
        <li>Premium Pool qualification eligibility</li>
        <li>Maximum earning rates</li>
        <li>Leadership recognition</li>
        <li>Exclusive features and privileges</li>
      </ul>
      
      <h4>5. Platinum</h4>
      <p><strong>Requirements:</strong></p>
      <ul>
        <li>Very high total staked amount</li>
        <li>Large and active referral network</li>
        <li>Multiple downlines at higher ranks</li>
        <li>Demonstrated leadership</li>
      </ul>
      <p><strong>Benefits:</strong></p>
      <ul>
        <li>All Gold benefits</li>
        <li>Premium Pool access</li>
        <li>Top-tier rewards</li>
        <li>VIP recognition</li>
        <li>Highest platform privileges</li>
      </ul>
      
      <h4>6. Diamond (Highest Rank)</h4>
      <p><strong>Requirements:</strong></p>
      <ul>
        <li>Maximum total staked amounts</li>
        <li>Extensive and thriving network</li>
        <li>Multiple high-rank downlines</li>
        <li>Exceptional platform leadership</li>
      </ul>
      <p><strong>Benefits:</strong></p>
      <ul>
        <li>All Platinum benefits</li>
        <li>Elite status and recognition</li>
        <li>Maximum possible earnings</li>
        <li>Exclusive Diamond Pool access</li>
        <li>Highest platform privileges</li>
        <li>Special rewards and recognition</li>
      </ul>
      
      <h3>Rank Progression Requirements</h3>
      <p>To progress to the next rank, you typically need to meet:</p>
      <ul>
        <li><strong>Financial Requirements:</strong> Minimum total staked amounts</li>
        <li><strong>Team Requirements:</strong> Number of direct referrals and downlines</li>
        <li><strong>Activity Requirements:</strong> Consistent platform engagement</li>
        <li><strong>Maintenance Requirements:</strong> Sustained performance</li>
      </ul>
      
      <h3>How to Rank Up</h3>
      <ol>
        <li><strong>Check Requirements:</strong> View rank requirements in your dashboard</li>
        <li><strong>Meet Financial Thresholds:</strong> Stake required amounts</li>
        <li><strong>Build Your Team:</strong> Refer users and help them succeed</li>
        <li><strong>Maintain Activity:</strong> Stay active on the platform</li>
        <li><strong>Monitor Progress:</strong> Track your rank progression status</li>
        <li><strong>Rank Up Automatically:</strong> Once requirements are met, rank upgrades automatically</li>
      </ol>
      
      <h3>Rank Regression System</h3>
      <p>Novunt may have a rank regression system to ensure active participation:</p>
      <ul>
        <li><strong>Maintenance Requirements:</strong> Must maintain certain activity levels</li>
        <li><strong>Regression Triggers:</strong> Inactivity or failure to maintain requirements</li>
        <li><strong>Grace Periods:</strong> Timeframes before regression occurs</li>
        <li><strong>Prevention:</strong> Stay active and meet maintenance requirements</li>
      </ul>
      <p><strong>To Prevent Regression:</strong></p>
      <ul>
        <li>Maintain required stake levels</li>
        <li>Keep team active and engaged</li>
        <li>Continue platform activity</li>
        <li>Meet ongoing rank requirements</li>
      </ul>
      
      <h3>Verification Badges</h3>
      <p>Ranks come with verification badges that indicate your status:</p>
      <ul>
        <li><strong>Visual Indicators:</strong> Badges appear on your profile</li>
        <li><strong>Trust Signals:</strong> Show your platform standing</li>
        <li><strong>Recognition:</strong> Demonstrate your success</li>
        <li><strong>Team Visibility:</strong> Your team can see your rank badge</li>
      </ul>
      
      <h3>Rank Benefits Summary</h3>
      <p>Higher ranks unlock:</p>
      <ul>
        <li><strong>Better Earning Rates:</strong> Higher ROS percentages</li>
        <li><strong>Pool Access:</strong> Qualification for higher-tier pools</li>
        <li><strong>Enhanced Commissions:</strong> Better referral rates</li>
        <li><strong>Platform Privileges:</strong> Access to exclusive features</li>
        <li><strong>Recognition:</strong> Status and respect in the community</li>
        <li><strong>Priority Support:</strong> Enhanced customer service</li>
      </ul>
      
      <h3>Tracking Your Rank Progress</h3>
      <p>You can monitor rank progression:</p>
      <ul>
        <li><strong>Dashboard:</strong> See current rank and progress</li>
        <li><strong>Rank Card:</strong> View requirements and completion status</li>
        <li><strong>Progress Bars:</strong> Visual indicators of requirement completion</li>
        <li><strong>Team Section:</strong> See how team building contributes to rank</li>
      </ul>
      
      <h3>Best Practices for Ranking Up</h3>
      <ul>
        <li><strong>Set Goals:</strong> Plan to reach specific rank targets</li>
        <li><strong>Build Systematically:</strong> Focus on requirements methodically</li>
        <li><strong>Help Your Team:</strong> Support downlines to rank up (helps your progress)</li>
        <li><strong>Stay Active:</strong> Maintain consistent platform activity</li>
        <li><strong>Monitor Requirements:</strong> Regularly check what's needed for next rank</li>
        <li><strong>Plan Financially:</strong> Budget for required stake amounts</li>
      </ul>
      
      <h3>Common Questions</h3>
      <h4>How long does it take to rank up?</h4>
      <p>Rank progression depends on how quickly you meet requirements. Some ranks can be achieved quickly, while higher ranks require significant time and effort.</p>
      
      <h4>Can I skip ranks?</h4>
      <p>No, ranks must be progressed sequentially. You cannot skip from Bronze directly to Gold, for example.</p>
      
      <h4>What happens if I don't maintain rank requirements?</h4>
      <p>You may regress to a lower rank if you don't maintain requirements. Check platform policies for specific regression rules.</p>
      
      <h4>Do rank benefits apply retroactively?</h4>
      <p>Rank benefits typically apply from the time you achieve the rank forward, not retroactively.</p>
      
      <h3>Rank Strategy Tips</h3>
      <ul>
        <li>Start by completing your profile and basic requirements</li>
        <li>Focus on building a strong referral network early</li>
        <li>Plan your staking strategy to meet financial requirements</li>
        <li>Help your team succeed to build network depth</li>
        <li>Maintain activity to prevent regression</li>
        <li>Set realistic timelines for rank progression</li>
      </ul>
      
      <p>Ready to start your rank progression journey? Check your current rank status and requirements in your dashboard!</p>
    `,
  },
  {
    id: 'profile-completion',
    title: 'Profile Completion & Social Media Verification',
    description:
      'Complete your profile to unlock features, verify social media accounts, and qualify for bonuses.',
    category: 'ranks-teams',
    readTime: 7,
    tags: ['Profile', 'Verification', 'Setup'],
    content: `
      <h2>Profile Completion & Social Media Verification</h2>
      <p>Completing your profile and verifying your social media accounts unlocks important features and benefits on Novunt. This guide explains how to complete these steps.</p>
      
      <h3>Why Complete Your Profile?</h3>
      <p>Profile completion provides several benefits:</p>
      <ul>
        <li><strong>Unlock Features:</strong> Access to advanced platform features</li>
        <li><strong>Qualify for Bonuses:</strong> Registration bonuses and other rewards</li>
        <li><strong>Rank Progression:</strong> Required for ranking up</li>
        <li><strong>Security:</strong> Better account security and verification</li>
        <li><strong>Team Building:</strong> Build trust with your referral network</li>
        <li><strong>Pool Access:</strong> May be required for pool qualifications</li>
      </ul>
      
      <h3>Profile Information to Complete</h3>
      <h4>Basic Information</h4>
      <ul>
        <li><strong>First Name:</strong> Your legal first name</li>
        <li><strong>Last Name:</strong> Your legal last name</li>
        <li><strong>Email:</strong> Already set during registration (verify if needed)</li>
        <li><strong>Phone Number:</strong> Optional but recommended for security</li>
      </ul>
      
      <h4>Profile Picture</h4>
      <ul>
        <li>Upload a clear profile photo</li>
        <li>Use a professional or appropriate image</li>
        <li>Helps with account recognition</li>
        <li>Builds trust with your network</li>
      </ul>
      
      <h4>Additional Details</h4>
      <ul>
        <li>Bio or description (optional)</li>
        <li>Location (optional)</li>
        <li>Other profile fields as available</li>
      </ul>
      
      <h3>How to Complete Your Profile</h3>
      <ol>
        <li><strong>Go to Profile:</strong> Navigate to your account profile/settings</li>
        <li><strong>Edit Profile:</strong> Click "Edit Profile" or "Complete Profile"</li>
        <li><strong>Fill Information:</strong> Enter all required fields</li>
        <li><strong>Upload Photo:</strong> Add a profile picture</li>
        <li><strong>Save Changes:</strong> Confirm and save your information</li>
        <li><strong>Verify Email:</strong> Verify your email if prompted</li>
      </ol>
      
      <h3>Social Media Verification</h3>
      <p>Verifying your social media accounts provides additional benefits and security.</p>
      
      <h4>Benefits of Social Media Verification</h4>
      <ul>
        <li><strong>Account Security:</strong> Additional verification layer</li>
        <li><strong>Trust Building:</strong> Shows you're a real user</li>
        <li><strong>Bonus Eligibility:</strong> May unlock special bonuses</li>
        <li><strong>Rank Requirements:</strong> May be needed for rank progression</li>
        <li><strong>Feature Access:</strong> Unlocks additional platform features</li>
      </ul>
      
      <h4>Supported Platforms</h4>
      <p>Novunt may support verification for:</p>
      <ul>
        <li>Twitter/X</li>
        <li>Facebook</li>
        <li>LinkedIn</li>
        <li>Instagram</li>
        <li>Other platforms (check platform for current list)</li>
      </ul>
      
      <h4>How to Verify Social Media</h4>
      <ol>
        <li><strong>Go to Profile Settings:</strong> Navigate to verification section</li>
        <li><strong>Select Platform:</strong> Choose the social media platform to verify</li>
        <li><strong>Connect Account:</strong> Authorize Novunt to connect to your account</li>
        <li><strong>Follow Instructions:</strong> Complete any required verification steps</li>
        <li><strong>Confirmation:</strong> Wait for verification confirmation</li>
        <li><strong>Verify Badge:</strong> Verified badge appears on your profile</li>
      </ol>
      
      <h3>Verification Requirements</h3>
      <p>For successful verification:</p>
      <ul>
        <li><strong>Active Account:</strong> Social media account must be active</li>
        <li><strong>Public Profile:</strong> May need to be publicly viewable</li>
        <li><strong>Matching Information:</strong> Name should match your Novunt profile</li>
        <li><strong>Authorization:</strong> Must authorize the connection</li>
      </ul>
      
      <h3>Profile Completion Checklist</h3>
      <ul>
        <li>✓ First name entered</li>
        <li>✓ Last name entered</li>
        <li>✓ Email verified</li>
        <li>✓ Profile picture uploaded</li>
        <li>✓ Phone number added (optional but recommended)</li>
        <li>✓ Social media accounts verified (optional but beneficial)</li>
        <li>✓ All required fields completed</li>
      </ul>
      
      <h3>After Completing Your Profile</h3>
      <p>Once your profile is complete:</p>
      <ul>
        <li>You'll see a completion indicator</li>
        <li>Qualify for registration bonuses</li>
        <li>Unlock rank progression eligibility</li>
        <li>Access additional platform features</li>
        <li>Build credibility with your network</li>
      </ul>
      
      <h3>Security Considerations</h3>
      <ul>
        <li><strong>Privacy:</strong> Only share information you're comfortable with</li>
        <li><strong>Accuracy:</strong> Use accurate information for verification</li>
        <li><strong>Protection:</strong> Your information is protected by platform security</li>
        <li><strong>Control:</strong> You control what information is visible</li>
      </ul>
      
      <h3>Updating Your Profile</h3>
      <p>You can update your profile anytime:</p>
      <ul>
        <li>Edit information as needed</li>
        <li>Change profile picture</li>
        <li>Add or remove social media verifications</li>
        <li>Update contact information</li>
      </ul>
      
      <h3>Common Issues & Solutions</h3>
      <h4>Verification Not Working</h4>
      <ul>
        <li>Ensure your social media account is active</li>
        <li>Check that you've authorized the connection</li>
        <li>Verify your profile information matches</li>
        <li>Try disconnecting and reconnecting</li>
        <li>Contact support if issues persist</li>
      </ul>
      
      <h4>Profile Not Completing</h4>
      <ul>
        <li>Check that all required fields are filled</li>
        <li>Ensure profile picture uploaded successfully</li>
        <li>Verify email if prompted</li>
        <li>Refresh and try again</li>
        <li>Contact support for assistance</li>
      </ul>
      
      <h3>Best Practices</h3>
      <ul>
        <li><strong>Complete Early:</strong> Finish profile setup as soon as possible</li>
        <li><strong>Use Real Information:</strong> Accurate info helps with verification</li>
        <li><strong>Professional Photo:</strong> Use an appropriate profile picture</li>
        <li><strong>Verify Social Media:</strong> Take advantage of verification benefits</li>
        <li><strong>Keep Updated:</strong> Update profile information as needed</li>
      </ul>
      
      <h3>Getting Started</h3>
      <ol>
        <li>Go to your profile/settings page</li>
        <li>Review what information is needed</li>
        <li>Complete all required fields</li>
        <li>Upload a profile picture</li>
        <li>Verify your social media accounts</li>
        <li>Save and confirm completion</li>
      </ol>
      
      <p>Complete your profile today to unlock all Novunt features and maximize your earning potential!</p>
    `,
  },
  // Security & Account
  {
    id: 'security-authentication',
    title: 'Security & Authentication',
    description:
      'Password requirements, 2FA setup, account security best practices, session management, and reporting issues.',
    category: 'security-account',
    readTime: 10,
    tags: ['Security', '2FA', 'Authentication'],
    content: `
      <h2>Security & Authentication</h2>
      <p>Protecting your Novunt account is essential. This guide covers password security, two-factor authentication (2FA), and best practices to keep your account safe.</p>
      
      <h3>Password Requirements</h3>
      <p>Novunt requires strong passwords to protect your account:</p>
      <ul>
        <li><strong>Minimum Length:</strong> Typically 8-12 characters (check current requirements)</li>
        <li><strong>Complexity:</strong> Mix of uppercase, lowercase, numbers, and special characters</li>
        <li><strong>Uniqueness:</strong> Don't reuse passwords from other accounts</li>
        <li><strong>No Personal Info:</strong> Avoid using easily guessable information</li>
      </ul>
      
      <h4>Creating a Strong Password</h4>
      <ul>
        <li>Use at least 12 characters</li>
        <li>Combine letters, numbers, and symbols</li>
        <li>Avoid dictionary words</li>
        <li>Don't use personal information (name, birthday, etc.)</li>
        <li>Consider using a password manager</li>
        <li>Make it memorable but complex</li>
      </ul>
      
      <h3>Two-Factor Authentication (2FA)</h3>
      <p>2FA adds an extra layer of security to your account by requiring a second verification step beyond your password.</p>
      
      <h4>Benefits of 2FA</h4>
      <ul>
        <li><strong>Enhanced Security:</strong> Protects against password theft</li>
        <li><strong>Account Protection:</strong> Prevents unauthorized access</li>
        <li><strong>Transaction Security:</strong> May be required for sensitive actions</li>
        <li><strong>Platform Requirement:</strong> May be needed for certain features</li>
      </ul>
      
      <h4>How to Enable 2FA</h4>
      <ol>
        <li><strong>Go to Settings:</strong> Navigate to account security settings</li>
        <li><strong>Find 2FA:</strong> Locate the Two-Factor Authentication section</li>
        <li><strong>Choose Method:</strong> Select authenticator app (recommended) or SMS</li>
        <li><strong>Scan QR Code:</strong> Use an authenticator app to scan the QR code</li>
        <li><strong>Enter Code:</strong> Enter the 6-digit code from your app</li>
        <li><strong>Save Backup Codes:</strong> Store recovery codes in a safe place</li>
        <li><strong>Confirm:</strong> Complete the setup process</li>
      </ol>
      
      <h4>Recommended Authenticator Apps</h4>
      <ul>
        <li>Google Authenticator</li>
        <li>Microsoft Authenticator</li>
        <li>Authy</li>
        <li>Other TOTP-compatible apps</li>
      </ul>
      
      <h4>2FA Backup Codes</h4>
      <p>When enabling 2FA, you'll receive backup codes:</p>
      <ul>
        <li><strong>Save Securely:</strong> Store in a safe, accessible location</li>
        <li><strong>Single Use:</strong> Each code can only be used once</li>
        <li><strong>Recovery:</strong> Use if you lose access to your authenticator</li>
        <li><strong>Regenerate:</strong> Generate new codes if needed</li>
      </ul>
      
      <h3>Account Security Best Practices</h3>
      <h4>Password Management</h4>
      <ul>
        <li>Never share your password with anyone</li>
        <li>Change password periodically (every 3-6 months)</li>
        <li>Use unique passwords for different accounts</li>
        <li>Consider using a password manager</li>
        <li>Don't write passwords in easily accessible places</li>
      </ul>
      
      <h4>Device Security</h4>
      <ul>
        <li>Keep devices updated with latest security patches</li>
        <li>Use device lock screens (PIN, fingerprint, face ID)</li>
        <li>Be cautious on public Wi-Fi networks</li>
        <li>Log out when using shared devices</li>
        <li>Use antivirus/anti-malware software</li>
      </ul>
      
      <h4>Email Security</h4>
      <ul>
        <li>Use a strong email password</li>
        <li>Enable 2FA on your email account</li>
        <li>Be cautious of phishing emails</li>
        <li>Verify email addresses before clicking links</li>
        <li>Report suspicious emails</li>
      </ul>
      
      <h4>General Practices</h4>
      <ul>
        <li>Never share account credentials</li>
        <li>Be cautious of phishing attempts</li>
        <li>Verify website URLs before logging in</li>
        <li>Monitor account activity regularly</li>
        <li>Report suspicious activity immediately</li>
      </ul>
      
      <h3>Session Management</h3>
      <h4>Active Sessions</h4>
      <p>You can view and manage active sessions:</p>
      <ul>
        <li>See all devices logged into your account</li>
        <li>View session locations and times</li>
        <li>Revoke suspicious sessions</li>
        <li>Log out from all devices if needed</li>
      </ul>
      
      <h4>Logging Out</h4>
      <ul>
        <li>Always log out when finished, especially on shared devices</li>
        <li>Use "Log out from all devices" if you suspect unauthorized access</li>
        <li>Sessions may expire after periods of inactivity</li>
      </ul>
      
      <h3>Recognizing Security Threats</h3>
      <h4>Phishing Attempts</h4>
      <p>Watch for:</p>
      <ul>
        <li>Emails requesting password or sensitive information</li>
        <li>Suspicious links that don't match Novunt's domain</li>
        <li>Urgent requests for immediate action</li>
        <li>Poor grammar or spelling in messages</li>
        <li>Requests for payment or cryptocurrency</li>
      </ul>
      
      <h4>Suspicious Activity</h4>
      <p>Be alert for:</p>
      <ul>
        <li>Unauthorized login attempts</li>
        <li>Unexpected transactions</li>
        <li>Changes to account settings you didn't make</li>
        <li>Emails about account changes you didn't initiate</li>
      </ul>
      
      <h3>Reporting Security Issues</h3>
      <p>If you suspect a security issue:</p>
      <ol>
        <li><strong>Change Password:</strong> Immediately change your password</li>
        <li><strong>Enable 2FA:</strong> If not already enabled, enable it immediately</li>
        <li><strong>Revoke Sessions:</strong> Log out from all devices</li>
        <li><strong>Contact Support:</strong> Report the issue to Novunt support</li>
        <li><strong>Monitor Account:</strong> Watch for suspicious activity</li>
        <li><strong>Document:</strong> Keep records of any suspicious activity</li>
      </ol>
      
      <h3>Recovering a Compromised Account</h3>
      <ol>
        <li>Change your password immediately</li>
        <li>Enable 2FA if not already enabled</li>
        <li>Revoke all active sessions</li>
        <li>Contact Novunt support</li>
        <li>Review transaction history</li>
        <li>Report any unauthorized transactions</li>
        <li>Update security settings</li>
      </ol>
      
      <h3>Security Checklist</h3>
      <ul>
        <li>✓ Strong, unique password set</li>
        <li>✓ Two-factor authentication enabled</li>
        <li>✓ Backup codes saved securely</li>
        <li>✓ Email account secured</li>
        <li>✓ Active sessions monitored</li>
        <li>✓ Security settings reviewed</li>
        <li>✓ Know how to report issues</li>
      </ul>
      
      <h3>Wallet Address Change Security</h3>
      <p>To protect your account from unauthorized wallet address changes, Novunt implements a security moratorium:</p>
      <ul>
        <li><strong>72-Hour Moratorium:</strong> When you change your withdrawal wallet address, there is a 72-hour waiting period before the new address becomes active</li>
        <li><strong>Security Purpose:</strong> This moratorium prevents unauthorized changes and gives you time to detect and report any suspicious activity</li>
        <li><strong>During Moratorium:</strong> Withdrawals will continue to use your previous wallet address until the 72-hour period expires</li>
        <li><strong>Notification:</strong> You'll receive notifications about the address change and when it becomes active</li>
        <li><strong>Cancel Option:</strong> If the change was unauthorized, you can contact support during the moratorium period to cancel it</li>
      </ul>
      <p><strong>Why This Matters:</strong> The 72-hour moratorium protects you from hackers who might gain access to your account and try to change your withdrawal address to steal your funds. Always monitor your account for unexpected address changes.</p>
      
      <h3>Additional Security Features</h3>
      <p>Novunt may offer additional security features:</p>
      <ul>
        <li><strong>Login Notifications:</strong> Email alerts for new logins</li>
        <li><strong>Transaction Confirmations:</strong> Require confirmation for sensitive actions</li>
        <li><strong>IP Restrictions:</strong> Limit access to specific IP addresses</li>
        <li><strong>Activity Logs:</strong> Review account activity history</li>
        <li><strong>Wallet Address Change Moratorium:</strong> 72-hour waiting period for wallet address changes</li>
      </ul>
      
      <h3>Common Questions</h3>
      <h4>What if I lose my 2FA device?</h4>
      <p>Use your backup codes to access your account, then set up 2FA on a new device. If you've lost backup codes, contact support for account recovery.</p>
      
      <h4>How often should I change my password?</h4>
      <p>Consider changing every 3-6 months, or immediately if you suspect any security breach.</p>
      
      <h4>Is 2FA required?</h4>
      <p>2FA may be required for certain features or transactions. It's highly recommended for all accounts.</p>
      
      <h3>Getting Started</h3>
      <ol>
        <li>Ensure you have a strong password</li>
        <li>Enable two-factor authentication</li>
        <li>Save backup codes securely</li>
        <li>Review security settings</li>
        <li>Monitor account activity regularly</li>
      </ol>
      
      <p>Protect your account today by following these security best practices!</p>
    `,
  },
  {
    id: 'common-questions-troubleshooting',
    title: 'Common Questions & Troubleshooting',
    description:
      'Frequently asked questions and solutions for common issues. Quick answers to help you resolve problems.',
    category: 'security-account',
    readTime: 15,
    tags: ['FAQ', 'Troubleshooting', 'Help'],
    content: `
      <h2>Common Questions & Troubleshooting</h2>
      <p>This guide answers frequently asked questions and provides solutions to common issues you might encounter on Novunt.</p>
      
      <h3>Account & Login Issues</h3>
      <h4>I forgot my password. How do I reset it?</h4>
      <ul>
        <li>Click "Forgot Password" on the login page</li>
        <li>Enter your registered email address</li>
        <li>Check your email for reset instructions</li>
        <li>Click the reset link and create a new password</li>
        <li>If you don't receive the email, check spam folder or contact support</li>
      </ul>
      
      <h4>I can't log in to my account</h4>
      <ul>
        <li>Verify you're using the correct email and password</li>
        <li>Check if Caps Lock is enabled</li>
        <li>Clear browser cache and cookies</li>
        <li>Try a different browser or device</li>
        <li>Disable VPN if using one</li>
        <li>Contact support if issues persist</li>
      </ul>
      
      <h4>My account is locked/suspended</h4>
      <ul>
        <li>Check your email for notification about the reason</li>
        <li>Contact Novunt support for account review</li>
        <li>Provide any requested documentation</li>
        <li>Wait for support team resolution</li>
      </ul>
      
      <h3>Deposit & Funding Issues</h3>
      <h4>My deposit hasn't appeared in my wallet</h4>
      <ul>
        <li>Wait for blockchain confirmations (usually 12-20 confirmations)</li>
        <li>Verify you sent USDT (not other cryptocurrencies)</li>
        <li>Check that you used BEP20 (Binance Smart Chain) network</li>
        <li>Verify the wallet address matches exactly</li>
        <li>Check transaction status on blockchain explorer using TXID</li>
        <li>Contact support with transaction hash if still not appearing</li>
      </ul>
      
      <h4>I sent funds to the wrong network</h4>
      <ul>
        <li>Contact Novunt support immediately</li>
        <li>Provide transaction hash and details</li>
        <li>Recovery may be possible but is not guaranteed</li>
        <li>Always double-check network before sending</li>
      </ul>
      
      <h4>What is the minimum deposit amount?</h4>
      <ul>
        <li>Minimum deposit varies by network (typically $10-50 USDT)</li>
        <li>Check the deposit page for current minimums</li>
        <li>Ensure you have enough to cover network fees</li>
      </ul>
      
      <h3>Staking & Earnings Issues</h3>
      <h4>Why didn't I receive my daily ROS today?</h4>
      <ul>
        <li>Check if your stake is still active</li>
        <li>Verify cool-down period has ended</li>
        <li>Check if maximum cap has been reached</li>
        <li>Review stake status and completion</li>
        <li>Check transaction history for ROS entries</li>
        <li>Contact support if you believe there's an error</li>
      </ul>
      
      <h4>My stake progress isn't updating</h4>
      <ul>
        <li>Progress updates daily, allow time for updates</li>
        <li>Refresh the page or check again later</li>
        <li>Verify stake is active and earning returns</li>
        <li>Contact support if progress hasn't updated in 24+ hours</li>
      </ul>
      
      <h4>How do I calculate my total earnings?</h4>
      <ul>
        <li>Check your Earnings Wallet balance</li>
        <li>View "Total Earned" on dashboard</li>
        <li>Review transaction history for all earnings</li>
        <li>Stakes page shows ROS earnings specifically</li>
      </ul>
      
      <h3>Withdrawal Issues</h3>
      <h4>My withdrawal is pending for a long time</h4>
      <ul>
        <li>Normal processing time is 24-48 hours</li>
        <li>Weekends and holidays may cause delays</li>
        <li>Check email for status updates</li>
        <li>Contact support if pending longer than 72 hours</li>
      </ul>
      
      <h4>My withdrawal was rejected</h4>
      <ul>
        <li>Check email for rejection reason</li>
        <li>Common reasons: invalid address, incomplete verification, insufficient balance</li>
        <li>Address any issues mentioned</li>
        <li>Resubmit withdrawal request</li>
        <li>Contact support if you need clarification</li>
      </ul>
      
      <h4>What are the withdrawal fees?</h4>
      <ul>
        <li>Novunt charges a 3% platform fee on all withdrawals</li>
        <li>Blockchain network fees apply (BEP20 only)</li>
        <li>The 3% platform fee is deducted from the withdrawal amount</li>
        <li>Network fees are also deducted from the withdrawal amount</li>
        <li>Total fees = 3% platform fee + network fee</li>
      </ul>
      
      <h3>Referral & Team Issues</h3>
      <h4>Someone signed up with my link but isn't showing in my team</h4>
      <ul>
        <li>They must complete registration and initial setup</li>
        <li>Allow time for system to update (may take a few minutes)</li>
        <li>Verify they used your exact referral link or code</li>
        <li>Check Team section after they've created an account</li>
        <li>Contact support if referral doesn't appear after 24 hours</li>
      </ul>
      
      <h4>I'm not receiving referral commissions</h4>
      <ul>
        <li>Commissions are earned when downlines are active</li>
        <li>Check if your referrals have created stakes or made deposits</li>
        <li>Verify commission rates for your rank</li>
        <li>Review transaction history for commission entries</li>
        <li>Contact support if commissions should be appearing</li>
      </ul>
      
      <h3>Rank & Pool Issues</h3>
      <h4>I met the requirements but didn't rank up</h4>
      <ul>
        <li>Requirements must be met simultaneously</li>
        <li>Allow time for system to process rank upgrade</li>
        <li>Refresh the page and check again</li>
        <li>Verify all requirements are actually met</li>
        <li>Check if maintenance requirements are also needed</li>
        <li>Contact support if rank should have upgraded</li>
      </ul>
      
      <h4>I don't qualify for pools even though I think I should</h4>
      <ul>
        <li>Review pool qualification requirements carefully</li>
        <li>Check your current rank and stake levels</li>
        <li>Verify team requirements (referral counts, etc.)</li>
        <li>Check if all requirements must be met simultaneously</li>
        <li>Review pool section for detailed requirements</li>
        <li>Contact support for clarification</li>
      </ul>
      
      <h3>Technical Issues</h3>
      <h4>The page isn't loading or is slow</h4>
      <ul>
        <li>Check your internet connection</li>
        <li>Clear browser cache and cookies</li>
        <li>Try a different browser</li>
        <li>Disable browser extensions</li>
        <li>Check if Novunt is experiencing maintenance</li>
        <li>Try again later if it's a temporary issue</li>
      </ul>
      
      <h4>I'm getting error messages</h4>
      <ul>
        <li>Note the exact error message</li>
        <li>Check if it's a temporary issue and try again</li>
        <li>Clear cache and refresh</li>
        <li>Try a different browser or device</li>
        <li>Contact support with error details</li>
      </ul>
      
      <h4>2FA isn't working</h4>
      <ul>
        <li>Ensure device time is synchronized</li>
        <li>Verify you're entering the correct 6-digit code</li>
        <li>Check if code has expired (codes refresh every 30 seconds)</li>
        <li>Try using backup codes if available</li>
        <li>Contact support for account recovery if needed</li>
      </ul>
      
      <h3>General Questions</h3>
      <h4>How do I contact support?</h4>
      <ul>
        <li>All support is in-app only. Use the Nova Assistant (Support icon on your dashboard)</li>
        <li>Create a ticket from the My Tickets tab in Nova Assistant</li>
        <li>Chat with our team directly in the ticket thread</li>
        <li>Include relevant details: account info, issue description, screenshots</li>
      </ul>
      
      <h4>Is Novunt safe and legitimate?</h4>
      <ul>
        <li>Novunt uses industry-standard security measures</li>
        <li>Platform implements 2FA and encryption</li>
        <li>Read platform terms and privacy policy</li>
        <li>Start with smaller amounts to test</li>
        <li>Research and verify independently</li>
      </ul>
      
      <h4>Can I have multiple accounts?</h4>
      <ul>
        <li>Generally, one account per person is allowed</li>
        <li>Multiple accounts may violate terms of service</li>
        <li>Self-referrals are not allowed</li>
        <li>Check terms of service for specific policies</li>
        <li>Contact support if you need multiple accounts for legitimate reasons</li>
      </ul>
      
      <h4>How do I update my profile information?</h4>
      <ul>
        <li>Go to profile/settings page</li>
        <li>Click "Edit Profile"</li>
        <li>Update desired information</li>
        <li>Save changes</li>
      </ul>
      
      <h3>Getting Additional Help</h3>
      <p>If you can't find an answer to your question:</p>
      <ol>
        <li>Check other knowledge base articles</li>
        <li>Use the Novunt Assistant for quick answers</li>
        <li>Contact support with detailed information</li>
        <li>Include screenshots if relevant</li>
        <li>Be patient - support responds as quickly as possible</li>
      </ol>
      
      <h3>Prevention Tips</h3>
      <ul>
        <li>Read knowledge base articles before starting</li>
        <li>Double-check all transactions before confirming</li>
        <li>Keep account information secure</li>
        <li>Regularly review account activity</li>
        <li>Stay updated on platform changes</li>
      </ul>
      
      <p>For additional help, use the Novunt Assistant or contact our support team. We're here to help!</p>
    `,
  },

  // ──────────── Getting Started (new) ────────────
  {
    id: 'onboarding-walkthrough',
    title: 'Onboarding Walkthrough',
    description:
      'A complete walkthrough of the 6-step onboarding carousel and how to claim your 10% registration bonus.',
    category: 'getting-started',
    readTime: 6,
    tags: ['Onboarding', 'Bonus', 'New User', 'Registration'],
    content: `
      <h2>Your First Minutes on Novunt</h2>
      <p>When you log in for the first time, you will see the Onboarding Carousel — six short slides that introduce every core feature. Here is what each slide covers and what you should do next.</p>

      <h3>Slide 1 — Welcome to Novunt</h3>
      <p><em>"Stake. Earn. Grow — Together."</em></p>
      <p>This is the mission statement. Novunt combines goal-based staking with a community-driven reward system so every user benefits as the network grows.</p>

      <h3>Slide 2 — 200% Accumulated ROS</h3>
      <p>Every stake you create targets a 200% return (your original amount + 100% profit). Returns are distributed daily until the target is reached.</p>

      <h3>Slide 3 — 10% Welcome Bonus</h3>
      <p>Complete five registration steps and receive a 10% bonus stake on your first qualifying deposit. The five steps are:</p>
      <ol>
        <li><strong>Email verification</strong> — confirm your email.</li>
        <li><strong>2FA setup</strong> — enable Google Authenticator.</li>
        <li><strong>Withdrawal address</strong> — whitelist a BEP20 wallet.</li>
        <li><strong>Social media</strong> — verify all 5 platforms (Facebook, Instagram, YouTube, TikTok, Telegram).</li>
        <li><strong>First stake</strong> — stake at least $20 USDT.</li>
      </ol>

      <h3>Slide 4 — Referral Earnings</h3>
      <p>Share your referral link and earn commissions across 5 levels when your referrals stake. More details in the <strong>Referral Bonus System</strong> article.</p>

      <h3>Slide 5 — Pool Rewards</h3>
      <p>As you climb ranks, you become eligible for the Performance and Premium reward pools — additional earnings distributed among qualified members.</p>

      <h3>Slide 6 — NXP → NLP</h3>
      <p>Earn Novunt Experience Points (NXP) for platform activity. NXP can later convert to Novunt Loyalty Points (NLP), unlocking future platform perks.</p>

      <h3>What To Do After Onboarding</h3>
      <ol>
        <li>Complete your profile (name, avatar).</li>
        <li>Enable 2FA immediately.</li>
        <li>Set your withdrawal address.</li>
        <li>Make your first deposit (USDT via BEP20).</li>
        <li>Create your first goal-based stake.</li>
      </ol>
      <p>Once all five registration bonus steps are complete, your 10% bonus stake activates automatically.</p>
    `,
  },
  {
    id: 'dashboard-guide',
    title: 'Understanding Your Dashboard',
    description:
      'A detailed guide to every card, stat, and feature on the Novunt dashboard.',
    category: 'getting-started',
    readTime: 7,
    tags: ['Dashboard', 'Navigation', 'Features', 'Overview'],
    content: `
      <h2>Your Dashboard at a Glance</h2>
      <p>The dashboard is your mission control. Here is what every section does.</p>

      <h3>Welcome Card</h3>
      <p>Shows your total portfolio value and total earnings. Tap the eye icon to hide or reveal your balances for privacy.</p>

      <h3>Quick Actions</h3>
      <p>Four buttons for the most common tasks:</p>
      <ul>
        <li><strong>Deposit</strong> — fund your Deposit Wallet with USDT.</li>
        <li><strong>Stake</strong> — create a new goal-based stake.</li>
        <li><strong>Transfer</strong> — send funds to another Novunt user (P2P).</li>
        <li><strong>Withdraw</strong> — move USDT from your Earnings Wallet to an external BEP20 address.</li>
      </ul>

      <h3>Stats Carousel</h3>
      <p>Rotates every 5 seconds through four key numbers: Total Earned, Total Staked, Total Deposited, and Total Withdrawn.</p>

      <h3>Feature Buttons</h3>
      <p>Eight shortcut tiles:</p>
      <ul>
        <li><strong>Freebies</strong> — claim your 10% registration bonus.</li>
        <li><strong>Refer & Earn</strong> — share your referral link (5% Level 1).</li>
        <li><strong>Rank</strong> — view your current rank and progress.</li>
        <li><strong>Wallet</strong> — manage both wallets and addresses.</li>
        <li><strong>Community</strong> — join our social channels.</li>
        <li><strong>Streak</strong> — view your staking streak milestones.</li>
        <li><strong>Support</strong> — open the Novunt Assistant.</li>
        <li><strong>Settings</strong> — profile, 2FA, notifications.</li>
      </ul>

      <h3>Activity Feed</h3>
      <p>Your five most recent transactions (deposits, stakes, payouts, transfers, withdrawals). Tap any item to see details.</p>

      <h3>Featured Stake Card</h3>
      <p>A rotating highlight of your active and completed stakes (changes every 35 seconds).</p>

      <h3>ROS Calendar</h3>
      <p>A month-to-date calendar view showing your daily Return on Stake percentage. Green days mean payouts were credited.</p>

      <h3>Live Platform Activities</h3>
      <p>A real-time feed of activity across the entire Novunt platform — deposits, withdrawals, new stakes, referral bonuses, rank promotions, and more. This gives you confidence that the platform is active and thriving.</p>
    `,
  },

  // ──────────── Staking & Goals (new) ────────────
  {
    id: 'staking-streak',
    title: 'Staking Streak & Milestones',
    description:
      'How the staking streak works, why consistency matters, and the milestones you can unlock.',
    category: 'staking-goals',
    readTime: 4,
    tags: ['Streak', 'Milestones', 'Consistency', 'Staking'],
    content: `
      <h2>What Is the Staking Streak?</h2>
      <p>Your staking streak counts the number of consecutive days you have had at least one active stake. It is a measure of your commitment and consistency on the platform.</p>

      <h3>How It Works</h3>
      <ul>
        <li>Every day you have one or more <strong>active</strong> stakes, your streak increments by 1.</li>
        <li>If you go a full day with zero active stakes, your streak resets to 0.</li>
        <li>Completed stakes that finished naturally do <strong>not</strong> break your streak — only having no active stakes at all does.</li>
      </ul>

      <h3>Milestones</h3>
      <p>As your streak grows, you reach milestones that may unlock recognition, badges, and future rewards. Keep an eye on the Streak card on your dashboard for your current progress and next milestone.</p>

      <h3>Tips for Maintaining Your Streak</h3>
      <ol>
        <li>Create a new stake before your current one completes if you want an unbroken streak.</li>
        <li>Even the minimum stake amount ($20) counts — it is the consistency that matters.</li>
        <li>Check the Streak modal regularly to see how close you are to the next milestone.</li>
      </ol>
    `,
  },
  {
    id: 'stake-goals-explained',
    title: 'Setting Smart Goals for Your Stakes',
    description:
      'How to use goal labels, choose the right amount, and track your progress toward financial targets.',
    category: 'staking-goals',
    readTime: 5,
    tags: ['Goals', 'Planning', 'Staking', 'Strategy'],
    content: `
      <h2>Why Set a Goal?</h2>
      <p>Every stake on Novunt can be tagged with an optional goal — a label that gives your stake a purpose. Goals help you stay motivated and organized, especially when managing multiple stakes.</p>

      <h3>Available Goal Categories</h3>
      <ul>
        <li><strong>Emergency Fund</strong> — build a safety net.</li>
        <li><strong>Housing</strong> — save toward a home.</li>
        <li><strong>Vehicle</strong> — fund your next car.</li>
        <li><strong>Travel</strong> — plan a vacation.</li>
        <li><strong>Education</strong> — invest in learning.</li>
        <li><strong>Wedding</strong> — prepare for the big day.</li>
        <li><strong>Retirement</strong> — long-term wealth building.</li>
        <li><strong>Business</strong> — seed capital for a venture.</li>
        <li><strong>Other</strong> — anything you want.</li>
      </ul>

      <h3>Choosing the Right Amount</h3>
      <ul>
        <li>Minimum stake: <strong>$20 USDT</strong>.</li>
        <li>Maximum stake: <strong>$10,000 USDT</strong>.</li>
        <li>You can fund from your Deposit Wallet, Earnings Wallet, or a combination of both.</li>
      </ul>

      <h3>Tracking Progress</h3>
      <p>Each stake card shows a progress bar from 0% to 200%. Daily payouts move the bar forward. Once it hits 200%, the stake completes and your principal plus earnings are available in your Earnings Wallet.</p>

      <h3>Pro Tips</h3>
      <ol>
        <li>Start with a smaller stake to understand the rhythm of daily payouts.</li>
        <li>Use different goals for different purposes so you can see at a glance what each stake is for.</li>
        <li>Re-stake completed earnings to compound your growth.</li>
      </ol>
    `,
  },

  // ──────────── Wallets & Finance (new) ────────────
  {
    id: 'fees-and-limits',
    title: 'Fees, Limits & Processing Times',
    description:
      'Everything you need to know about deposit fees, withdrawal fees, transfer limits, and how long operations take.',
    category: 'wallets-finance',
    readTime: 5,
    tags: ['Fees', 'Limits', 'Withdrawals', 'Deposits', 'Processing'],
    content: `
      <h2>Fee & Limit Overview</h2>
      <p>Novunt strives to keep fees low and transparent. Below is a summary of the key numbers.</p>

      <h3>Deposits</h3>
      <ul>
        <li><strong>Minimum deposit:</strong> 20 USDT.</li>
        <li><strong>Network:</strong> BEP20 (Binance Smart Chain) only.</li>
        <li><strong>Fee:</strong> A small network fee is deducted automatically. The exact amount is shown before you confirm.</li>
        <li><strong>Processing:</strong> Usually confirmed within a few minutes depending on network congestion.</li>
      </ul>

      <h3>Withdrawals</h3>
      <ul>
        <li><strong>Source:</strong> Earnings Wallet only (you cannot withdraw directly from the Deposit Wallet).</li>
        <li><strong>Minimum withdrawal:</strong> Shown in the withdrawal screen.</li>
        <li><strong>Fee:</strong> A percentage-based fee is disclosed before confirmation.</li>
        <li><strong>Processing:</strong> Withdrawals require admin approval and are typically processed within 1–24 hours.</li>
        <li><strong>Daily limit:</strong> There is a daily withdrawal limit to protect all users.</li>
        <li><strong>Address moratorium:</strong> After changing your whitelisted withdrawal address, a 72-hour waiting period applies before you can withdraw.</li>
      </ul>

      <h3>P2P Transfers</h3>
      <ul>
        <li><strong>Fee:</strong> Free — no fees for transferring between Novunt users.</li>
        <li><strong>Speed:</strong> Instant.</li>
        <li><strong>Minimum:</strong> A minimum transfer amount applies (shown in the transfer screen).</li>
        <li><strong>Verification:</strong> Requires email OTP and 2FA for security.</li>
      </ul>

      <h3>Staking</h3>
      <ul>
        <li><strong>Minimum stake:</strong> $20 USDT.</li>
        <li><strong>Maximum stake:</strong> $10,000 USDT.</li>
        <li><strong>No fee</strong> to create a stake — the full amount you enter is staked.</li>
      </ul>
    `,
  },

  // ──────────── Earning Systems (new) ────────────
  {
    id: 'nxp-nlp-tokens',
    title: 'NXP & NLP Tokens Explained',
    description:
      'What Novunt Experience Points (NXP) are, how you earn them, and what Novunt Loyalty Points (NLP) will unlock.',
    category: 'earning-systems',
    readTime: 4,
    tags: ['NXP', 'NLP', 'Tokens', 'Rewards', 'Loyalty'],
    content: `
      <h2>Two Token Systems</h2>
      <p>Novunt has two complementary point systems that reward your activity on the platform.</p>

      <h3>NXP — Novunt Experience Points</h3>
      <p>NXP is earned automatically as you use the platform. Activities that earn NXP include:</p>
      <ul>
        <li>Creating stakes</li>
        <li>Completing stakes (reaching 200%)</li>
        <li>Referring new users</li>
        <li>Maintaining staking streaks</li>
        <li>Climbing ranks</li>
        <li>Completing profile and verification steps</li>
      </ul>
      <p>Your NXP total is visible in the Achievement System on your dashboard.</p>

      <h3>NLP — Novunt Loyalty Points</h3>
      <p>NLP is the next evolution of the reward system. NXP will convert to NLP, which will unlock exclusive benefits such as:</p>
      <ul>
        <li>Reduced fees</li>
        <li>Priority support</li>
        <li>Early access to new features</li>
        <li>Exclusive promotions and campaigns</li>
      </ul>
      <p>Stay active and accumulate NXP now — the more you earn, the more NLP you will receive when the conversion launches.</p>
    `,
  },
  {
    id: 'maximizing-earnings',
    title: 'Maximizing Your Earnings on Novunt',
    description:
      'Practical strategies to combine staking, referrals, pools, and bonuses for the highest possible returns.',
    category: 'earning-systems',
    readTime: 6,
    tags: ['Strategy', 'Earnings', 'Tips', 'Compounding'],
    content: `
      <h2>Earning Channels on Novunt</h2>
      <p>Novunt offers multiple earning streams. The key to maximizing returns is using them together.</p>

      <h3>1. Stake Consistently</h3>
      <ul>
        <li>Every stake earns daily ROS payouts toward a 200% target.</li>
        <li>When a stake completes, re-stake your earnings to compound your growth.</li>
        <li>Keep at least one active stake at all times to maintain your staking streak.</li>
      </ul>

      <h3>2. Build Your Referral Network</h3>
      <ul>
        <li>Level 1 referrals earn you <strong>5%</strong> commission.</li>
        <li>Level 2: <strong>2%</strong>, Level 3: <strong>1.5%</strong>, Level 4: <strong>1%</strong>, Level 5: <strong>0.5%</strong>.</li>
        <li>Referral earnings go to your Earnings Wallet and can be re-staked.</li>
        <li>Active referrals (those who stake) count toward your rank progression.</li>
      </ul>

      <h3>3. Climb the Ranks</h3>
      <p>Higher ranks unlock access to the Performance and Premium pools. Pool distributions are additional earnings on top of your ROS. Requirements include personal stake amounts, team stake volumes, and active downline counts.</p>

      <h3>4. Claim All Bonuses</h3>
      <ul>
        <li><strong>Registration bonus:</strong> 10% on your first stake (complete all 5 setup steps).</li>
        <li><strong>Referral bonuses:</strong> Earn on 5 levels of referrals.</li>
        <li><strong>Rank bonuses:</strong> Distributed when you reach new ranks.</li>
      </ul>

      <h3>5. Compound, Compound, Compound</h3>
      <p>The most effective strategy is re-staking your earnings. When a stake completes at 200%, take the earnings and create a new, larger stake. Over time, this compounding effect significantly increases your returns.</p>
    `,
  },

  // ──────────── Ranks & Teams (new) ────────────
  {
    id: 'building-your-team',
    title: 'Building & Managing Your Team',
    description:
      'How to share your referral link, track team members, understand levels, and grow a strong downline.',
    category: 'ranks-teams',
    readTime: 5,
    tags: ['Team', 'Referral', 'Downline', 'Leadership'],
    content: `
      <h2>Your Team Page</h2>
      <p>Navigate to <strong>Team</strong> from the sidebar or bottom navigation to see your full referral network.</p>

      <h3>Sharing Your Link</h3>
      <ul>
        <li>Your unique referral link and code are displayed at the top of the Team page.</li>
        <li>Share via social media, messaging apps, or email.</li>
        <li>When someone registers using your link, they become your Level 1 referral.</li>
      </ul>

      <h3>Understanding Levels</h3>
      <ul>
        <li><strong>Level 1:</strong> Users you directly referred — you earn 5% commission on their stakes.</li>
        <li><strong>Level 2:</strong> Users your Level 1 referrals invited — 2% commission.</li>
        <li><strong>Level 3:</strong> 1.5% commission.</li>
        <li><strong>Level 4:</strong> 1% commission.</li>
        <li><strong>Level 5:</strong> 0.5% commission.</li>
      </ul>
      <p>Commissions are earned whenever a referral at any of these levels creates or earns from a stake.</p>

      <h3>Tracking Your Team</h3>
      <p>The Team page shows:</p>
      <ul>
        <li>Total direct referrals and how many are active (have stakes).</li>
        <li>Total team members across all levels.</li>
        <li>Individual member details: username, level, team stake, and join date.</li>
      </ul>

      <h3>Why Team Size Matters</h3>
      <p>Your team size and activity directly affect your rank. Higher ranks require more direct referrals with qualifying stakes and larger total team stake volumes. Growing an active team is the fastest path to the Performance and Premium pools.</p>
    `,
  },

  // ──────────── Security & Account (new) ────────────
  {
    id: 'account-settings-guide',
    title: 'Account Settings & Preferences',
    description:
      'How to manage your profile, notification preferences, display settings, and connected accounts.',
    category: 'security-account',
    readTime: 4,
    tags: ['Settings', 'Profile', 'Notifications', 'Preferences'],
    content: `
      <h2>Managing Your Account</h2>
      <p>Access your settings by tapping the gear icon on the dashboard or navigating to Settings from the menu.</p>

      <h3>Profile</h3>
      <ul>
        <li><strong>Name & Username:</strong> Tap your avatar or name to open the profile editor. Update your first name, last name, and username.</li>
        <li><strong>Avatar:</strong> Upload a custom profile picture or choose from the built-in badge avatars.</li>
        <li><strong>Email:</strong> Your email is set during registration and is used for OTP verification and notifications.</li>
      </ul>

      <h3>Security</h3>
      <ul>
        <li><strong>Two-Factor Authentication (2FA):</strong> Enable or disable Google Authenticator. Required for withdrawals, transfers, and address changes.</li>
        <li><strong>Password:</strong> Change your password from the security settings.</li>
      </ul>

      <h3>Notifications</h3>
      <ul>
        <li>View all notifications in the notification center (bell icon).</li>
        <li>Filter by "All" or "System" notifications.</li>
        <li>Important alerts (security, transactions, rank changes) are always delivered.</li>
      </ul>

      <h3>Withdrawal Address</h3>
      <ul>
        <li>Set your default BEP20 withdrawal address in the Wallet settings.</li>
        <li>Changing this address triggers a 72-hour moratorium before you can withdraw.</li>
        <li>2FA is required to set or change the address.</li>
      </ul>
    `,
  },

  // ──────────── New category: Platform Glossary ────────────
  {
    id: 'glossary',
    title: 'Novunt Glossary',
    description:
      'A quick-reference dictionary of every term and abbreviation used on the Novunt platform.',
    category: 'glossary',
    readTime: 5,
    tags: ['Glossary', 'Terms', 'Definitions', 'Reference'],
    content: `
      <h2>Platform Glossary</h2>
      <p>Use this reference to quickly understand any term you encounter on Novunt.</p>

      <table>
        <tr><td><strong>ROS</strong></td><td>Return on Stake — the profit earned on a stake, distributed daily.</td></tr>
        <tr><td><strong>200% Target</strong></td><td>The default return target for every stake: your original amount plus 100% profit (2x total).</td></tr>
        <tr><td><strong>Funded Wallet</strong></td><td>Also called Deposit Wallet. Receives deposits and P2P transfers. Used to create stakes.</td></tr>
        <tr><td><strong>Earnings Wallet</strong></td><td>Receives ROS payouts, referral commissions, and bonuses. Used for withdrawals and transfers.</td></tr>
        <tr><td><strong>BEP20</strong></td><td>The Binance Smart Chain token standard. Novunt only accepts USDT on BEP20.</td></tr>
        <tr><td><strong>USDT</strong></td><td>Tether — a stablecoin pegged to the US Dollar. The only currency used on Novunt.</td></tr>
        <tr><td><strong>Smart Goal Staking</strong></td><td>The ability to tag each stake with a personal goal (housing, education, travel, etc.).</td></tr>
        <tr><td><strong>P2P Transfer</strong></td><td>Peer-to-peer transfer between two Novunt users. Free and instant.</td></tr>
        <tr><td><strong>NXP</strong></td><td>Novunt Experience Points — earned through platform activity.</td></tr>
        <tr><td><strong>NLP</strong></td><td>Novunt Loyalty Points — future reward token converted from NXP.</td></tr>
        <tr><td><strong>2FA</strong></td><td>Two-Factor Authentication via Google Authenticator.</td></tr>
        <tr><td><strong>OTP</strong></td><td>One-Time Password — sent to your email for verifying sensitive actions.</td></tr>
        <tr><td><strong>Moratorium</strong></td><td>A 72-hour waiting period after changing your withdrawal address.</td></tr>
        <tr><td><strong>Staking Streak</strong></td><td>Consecutive days with at least one active stake.</td></tr>
        <tr><td><strong>Performance Pool</strong></td><td>A reward pool for qualified higher-rank members.</td></tr>
        <tr><td><strong>Premium Pool</strong></td><td>An exclusive reward pool for top-tier rank members.</td></tr>
        <tr><td><strong>Downline</strong></td><td>Users in your referral network (Levels 1–5).</td></tr>
        <tr><td><strong>Qualifying Stake</strong></td><td>A stake that meets the minimum requirement for referral and rank eligibility.</td></tr>
      </table>
    `,
  },
  {
    id: 'platform-faq',
    title: 'Frequently Asked Questions',
    description:
      'Quick answers to the most common questions new and existing users ask about Novunt.',
    category: 'glossary',
    readTime: 6,
    tags: ['FAQ', 'Questions', 'Help', 'Answers'],
    content: `
      <h2>Frequently Asked Questions</h2>

      <h3>General</h3>
      <p><strong>Q: What is Novunt?</strong></p>
      <p>A: Novunt is a goal-based staking platform where you deposit USDT, create stakes with personal financial goals, and earn daily returns (ROS) targeting 200% of your stake amount.</p>

      <p><strong>Q: Is Novunt free to use?</strong></p>
      <p>A: Creating an account is free. Fees apply to deposits (network fee) and withdrawals (percentage fee). P2P transfers between users are free. Creating stakes has no fee.</p>

      <p><strong>Q: What currency does Novunt support?</strong></p>
      <p>A: USDT (Tether) on the BEP20 network (Binance Smart Chain) only.</p>

      <h3>Staking</h3>
      <p><strong>Q: What is the minimum stake?</strong></p>
      <p>A: $20 USDT.</p>

      <p><strong>Q: How long does a stake take to complete?</strong></p>
      <p>A: It depends on the daily ROS rate. Stakes earn daily returns and complete when total earnings reach 200% of the staked amount.</p>

      <p><strong>Q: Can I cancel a stake early?</strong></p>
      <p>A: Early withdrawal options depend on the stake status. Check the stake details card for available actions.</p>

      <h3>Wallets</h3>
      <p><strong>Q: Why are there two wallets?</strong></p>
      <p>A: The Funded Wallet holds your deposits and is used for creating stakes. The Earnings Wallet receives all your returns and is used for withdrawals. This separation protects your capital and makes accounting clear.</p>

      <p><strong>Q: How long do withdrawals take?</strong></p>
      <p>A: Withdrawals require admin approval and are typically processed within 1–24 hours.</p>

      <p><strong>Q: Why can't I withdraw after changing my address?</strong></p>
      <p>A: A 72-hour security moratorium applies after any withdrawal address change. This protects you in case your account is compromised.</p>

      <h3>Referrals & Teams</h3>
      <p><strong>Q: How much do I earn from referrals?</strong></p>
      <p>A: Level 1: 5%, Level 2: 2%, Level 3: 1.5%, Level 4: 1%, Level 5: 0.5%.</p>

      <p><strong>Q: Do my referrals need to stake for me to earn?</strong></p>
      <p>A: Yes. You earn commissions when your referrals create or earn from stakes. Inactive referrals (no stakes) do not generate commissions.</p>

      <h3>Security</h3>
      <p><strong>Q: Is 2FA required?</strong></p>
      <p>A: 2FA is required for withdrawals, transfers, and changing your withdrawal address. We strongly recommend enabling it immediately after registration.</p>

      <p><strong>Q: What if I lose my 2FA device?</strong></p>
      <p>A: Create a support ticket in the app with your account details. You will need to verify your identity before 2FA can be reset.</p>
    `,
  },

  // ──────────── Security & Account (new batch) ────────────
  {
    id: 'two-factor-authentication',
    title: 'Two-Factor Authentication (2FA) Guide',
    description:
      'How to set up, use, and manage 2FA on Novunt — including which actions require it and what to do if you lose access.',
    category: 'security-account',
    readTime: 6,
    tags: ['2FA', 'Security', 'Google Authenticator', 'TOTP'],
    content: `
      <h2>What Is 2FA?</h2>
      <p>Two-Factor Authentication (2FA) adds an extra layer of security to your Novunt account. In addition to your password, you must enter a 6-digit code from an authenticator app every time you perform a sensitive action.</p>

      <h3>Why 2FA Matters</h3>
      <p>Even if someone obtains your password, they cannot withdraw funds, transfer USDT, or change your withdrawal address without access to the code from your authenticator app. Enabling 2FA is one of the most important steps you can take to protect your account.</p>

      <h3>Setting Up 2FA</h3>
      <ol>
        <li>Open your <strong>Settings</strong> (gear icon on the dashboard).</li>
        <li>Go to the <strong>Security</strong> tab.</li>
        <li>Tap <strong>Enable 2FA</strong>.</li>
        <li>A QR code will appear on screen.</li>
        <li>Open <strong>Google Authenticator</strong>, <strong>Authy</strong>, or any TOTP-compatible app on your phone.</li>
        <li>Scan the QR code (or manually enter the secret key shown below it).</li>
        <li>Enter the 6-digit code displayed in the authenticator app into Novunt.</li>
        <li>Tap <strong>Verify & Enable</strong>.</li>
      </ol>
      <p>Once enabled, your authenticator app will generate a new 6-digit code every 30 seconds.</p>

      <h3>Actions That Require 2FA</h3>
      <ul>
        <li><strong>Withdrawals</strong> — every withdrawal requires your 2FA code plus an email OTP.</li>
        <li><strong>P2P Transfers</strong> — sending USDT to another Novunt user requires 2FA plus email OTP.</li>
        <li><strong>Setting or changing your withdrawal address</strong> — 2FA is required to whitelist or update your BEP20 address.</li>
        <li><strong>Changing your password</strong> — requires 2FA for confirmation.</li>
        <li><strong>Disabling 2FA</strong> — you must enter a valid 2FA code to turn it off.</li>
      </ul>

      <h3>What If I Lose My Phone?</h3>
      <p>If you lose access to your authenticator app:</p>
      <ol>
        <li>Contact Novunt support via the Support section in the app.</li>
        <li>Provide your account email and username.</li>
        <li>Support will verify your identity before resetting 2FA.</li>
        <li>Once reset, set up 2FA again immediately with your new device.</li>
      </ol>

      <h3>Best Practices</h3>
      <ul>
        <li>Enable 2FA <strong>immediately</strong> after creating your account — it is one of the five registration bonus steps.</li>
        <li>Use a trusted authenticator app (Google Authenticator, Authy, Microsoft Authenticator).</li>
        <li>Back up your authenticator app or save the secret key in a secure place when you first set up 2FA.</li>
        <li>Never share your 2FA codes with anyone, including support staff.</li>
      </ul>
    `,
  },
  {
    id: 'withdrawal-address-whitelist',
    title: 'Withdrawal Address & Whitelist',
    description:
      'How to set your BEP20 withdrawal address, what the 72-hour moratorium is, and why it protects your funds.',
    category: 'security-account',
    readTime: 5,
    tags: ['Whitelist', 'Withdrawal', 'BEP20', 'Moratorium', 'Address'],
    content: `
      <h2>Your Withdrawal Address</h2>
      <p>Before you can withdraw USDT from Novunt, you must set a default withdrawal address. This is a BEP20 (Binance Smart Chain) wallet address where your funds will be sent.</p>

      <h3>Setting Your Address</h3>
      <ol>
        <li>Open your <strong>Wallet</strong> from the dashboard.</li>
        <li>Go to <strong>Withdrawal Whitelist</strong> (or start a withdrawal — you will be prompted if no address is set).</li>
        <li>Enter your BEP20 wallet address (starts with <code>0x</code>).</li>
        <li>Enter your <strong>2FA code</strong> to confirm.</li>
        <li>Tap <strong>Save Address</strong>.</li>
      </ol>
      <p><strong>Important:</strong> Only Binance Smart Chain (BEP20) addresses are supported. Sending to the wrong network may result in permanent loss of funds.</p>

      <h3>The 72-Hour Moratorium</h3>
      <p>Whenever you change your withdrawal address, a <strong>72-hour security hold</strong> is automatically applied. During this period, you cannot make any withdrawals.</p>
      <p><strong>Why?</strong> This protects you from unauthorized access. If a hacker gains access to your account and changes the withdrawal address, the 72-hour window gives you time to detect the breach and contact support before any funds can be moved.</p>
      <p>During the moratorium, you will see a countdown timer showing when withdrawals will become available again.</p>

      <h3>Key Rules</h3>
      <ul>
        <li>You can only have <strong>one</strong> whitelisted withdrawal address at a time.</li>
        <li>2FA is <strong>always required</strong> to set or change the address.</li>
        <li>The 72-hour moratorium starts fresh every time the address is changed.</li>
        <li>Deposits, staking, and P2P transfers are <strong>not affected</strong> by the moratorium — only withdrawals.</li>
      </ul>

      <h3>Troubleshooting</h3>
      <ul>
        <li><strong>"Address Moratorium Active"</strong> — You recently changed your address. Wait for the countdown to reach zero.</li>
        <li><strong>"Withdrawal Address Required"</strong> — You have not set an address yet. Go to Wallet → Withdrawal Whitelist to set one.</li>
        <li><strong>"Duplicate Withdrawal Address"</strong> — The address you entered is already your current whitelisted address.</li>
      </ul>
    `,
  },

  // ──────────── Getting Started (new batch) ────────────
  {
    id: 'freebies-registration-bonus',
    title: 'Freebies: Your 10% Registration Bonus',
    description:
      'A complete guide to claiming your 10% welcome bonus — the five steps, progress tracking, and bonus activation.',
    category: 'getting-started',
    readTime: 6,
    tags: ['Freebies', 'Bonus', 'Registration', 'Welcome', '10%'],
    content: `
      <h2>What Is the Registration Bonus?</h2>
      <p>Every new Novunt user is eligible for a <strong>10% registration bonus</strong>. When you complete all five setup steps and make your first qualifying stake, Novunt creates an additional bonus stake worth 10% of your first stake amount.</p>

      <h3>The Five Steps (20% Progress Each)</h3>
      <p>Your bonus progress bar fills 20% with each step you complete:</p>
      <ol>
        <li><strong>Registration & Email Verification</strong> — This is automatic when you sign up and confirm your email. (20%)</li>
        <li><strong>Enable 2FA</strong> — Set up Google Authenticator or any TOTP app from your Security settings. (40%)</li>
        <li><strong>Set Withdrawal Address</strong> — Add your BEP20 wallet address in the Wallet section. (60%)</li>
        <li><strong>Verify Social Media</strong> — Follow Novunt on all 5 platforms: <strong>Facebook</strong>, <strong>Instagram</strong>, <strong>YouTube</strong>, <strong>TikTok</strong>, and <strong>Telegram</strong>. (80%)</li>
        <li><strong>First Stake</strong> — Create your first stake of at least <strong>$20 USDT</strong>. (100%)</li>
      </ol>

      <h3>How Social Media Verification Works</h3>
      <ol>
        <li>In the Freebies section, tap a social media platform icon.</li>
        <li>Novunt opens the platform in a new tab and asks you to follow our official account.</li>
        <li>After following, return to Novunt and confirm.</li>
        <li>Repeat for all five platforms.</li>
      </ol>

      <h3>Bonus Activation</h3>
      <p>Once all five steps are at 100%, your bonus activates automatically. The 10% bonus stake appears alongside your regular stakes and earns daily ROS just like any other stake.</p>

      <h3>Bonus Statuses</h3>
      <ul>
        <li><strong>Pending</strong> — Steps still in progress.</li>
        <li><strong>Requirements Met</strong> — All 5 steps complete; waiting for activation.</li>
        <li><strong>Bonus Active</strong> — Your bonus stake is live and earning ROS.</li>
        <li><strong>Completed</strong> — Bonus stake has reached its target.</li>
        <li><strong>Expired</strong> — Deadline passed before completion (start early!).</li>
      </ul>

      <h3>Where to Find It</h3>
      <p>Tap the <strong>Freebies</strong> button on your dashboard, or look for the "Your Registration Bonus Awaits!" banner that appears until all steps are done.</p>
    `,
  },
  {
    id: 'novunt-assistant-support',
    title: 'Getting Help: Novunt Assistant & Support',
    description:
      'How to use the AI-powered Novunt Assistant, create support tickets, and track your ticket status.',
    category: 'getting-started',
    readTime: 4,
    tags: ['Support', 'Help', 'Assistant', 'Tickets', 'Nova'],
    content: `
      <h2>The Novunt Assistant (Nova)</h2>
      <p>Novunt includes an AI-powered assistant named <strong>Nova</strong> that can help you with most questions about the platform. You can access it by tapping the <strong>Support</strong> button on your dashboard or the chat icon in the bottom-right corner.</p>

      <h3>What Nova Can Help With</h3>
      <ul>
        <li>Explaining platform features (staking, deposits, ROS, pools, etc.).</li>
        <li>Guiding you through common tasks step by step.</li>
        <li>Answering questions about your account, wallets, or stakes.</li>
        <li>Troubleshooting common issues.</li>
      </ul>

      <h3>Escalating to Human Support</h3>
      <p>If Nova cannot resolve your issue, you can escalate to the support team:</p>
      <ol>
        <li>Tap <strong>"Talk to Support"</strong> or <strong>"Create Ticket"</strong> in the assistant.</li>
        <li>Fill in the form: <strong>subject</strong>, <strong>description</strong>, <strong>category</strong> (technical, account, billing, general, other), and <strong>priority</strong> (low, medium, high, urgent).</li>
        <li>Submit. Your ticket is created and the team is notified.</li>
      </ol>

      <h3>Tracking Your Tickets</h3>
      <p>Tap <strong>"My Tickets"</strong> in the assistant to see all your submitted tickets. Each ticket shows its current status:</p>
      <ul>
        <li><strong>Submitted</strong> — received and waiting for review.</li>
        <li><strong>In Progress</strong> — the team is working on it.</li>
        <li><strong>Resolved</strong> — a solution has been provided.</li>
        <li><strong>Closed</strong> — the ticket is complete.</li>
      </ul>

      <h3>In-App Support Only</h3>
      <p>All support is handled in the app. Use the Support section to create tickets and chat with our team. You&apos;ll get notifications when we reply.</p>
    `,
  },

  // ──────────── Wallets & Finance (new batch) ────────────
  {
    id: 'deposit-step-by-step',
    title: 'Making a Deposit: Step-by-Step',
    description:
      'A detailed walkthrough of the deposit process — from entering an amount to seeing funds in your wallet.',
    category: 'wallets-finance',
    readTime: 6,
    tags: ['Deposit', 'USDT', 'BEP20', 'QR Code', 'Walkthrough'],
    content: `
      <h2>Deposit Walkthrough</h2>
      <p>Depositing USDT into your Novunt Funded Wallet is straightforward. Follow these steps:</p>

      <h3>Step 1: Open the Deposit Screen</h3>
      <p>From your dashboard, tap <strong>Deposit</strong> in the Quick Actions, or go to <strong>Wallet → Deposit</strong>.</p>

      <h3>Step 2: Enter Amount</h3>
      <ul>
        <li>Enter the amount you want to deposit (minimum <strong>20 USDT</strong>).</li>
        <li>The screen shows a <strong>Fee Breakdown</strong>: network fee, service fee, the total amount you need to send, and the amount you will receive after fees.</li>
        <li>Network: <strong>BEP20 (Binance Smart Chain)</strong> — this is the only supported network.</li>
      </ul>

      <h3>Step 3: Generate Payment Address</h3>
      <p>Tap <strong>Generate Payment Address</strong>. Novunt creates a unique deposit address and QR code for your transaction.</p>

      <h3>Step 4: Send USDT</h3>
      <ul>
        <li>Copy the deposit address or scan the QR code with your external wallet (Trust Wallet, MetaMask, Binance, etc.).</li>
        <li>Send exactly the amount shown (the "you need to send" amount) as <strong>USDT on BEP20</strong>.</li>
        <li>If a <strong>Payment URL</strong> link is available, you can tap "Open Payment Instructions" to be guided through the payment on the provider's site.</li>
      </ul>

      <h3>Step 5: Wait for Confirmation</h3>
      <p>After sending, tap <strong>"I've Sent the Payment"</strong>. Novunt polls the blockchain approximately every 12 seconds to detect your transaction. You will see a spinner with the message: <em>"Confirming… This screen will switch to Deposit Confirmed when the payment is received."</em></p>

      <h3>Step 6: Success</h3>
      <p>When confirmed, you will see a success summary showing the deposited amount and your updated wallet balance. From here, you can immediately <strong>Create a Stake</strong> with your new funds.</p>

      <h3>Sandbox / Test Mode</h3>
      <p>If you see an orange <strong>"Sandbox Mode"</strong> or <strong>"Test Environment"</strong> badge, you are in a test environment. No real funds will be transferred. This is used for testing purposes only.</p>

      <h3>Common Issues</h3>
      <ul>
        <li><strong>Wrong network:</strong> Only BEP20 is supported. Sending via ERC20, TRC20, or other networks may result in permanent loss.</li>
        <li><strong>Below minimum:</strong> Deposits below 20 USDT will not be processed.</li>
        <li><strong>Delayed confirmation:</strong> Network congestion can slow confirmations. If your deposit does not appear within 30 minutes, contact support.</li>
      </ul>
    `,
  },
  {
    id: 'withdrawal-step-by-step',
    title: 'Making a Withdrawal: Step-by-Step',
    description:
      'How to withdraw USDT from your Earnings Wallet — requirements, verification, processing times, and limits.',
    category: 'wallets-finance',
    readTime: 5,
    tags: ['Withdrawal', 'USDT', 'BEP20', 'OTP', '2FA'],
    content: `
      <h2>Withdrawal Walkthrough</h2>
      <p>Withdrawals send USDT from your <strong>Earnings Wallet</strong> to your whitelisted BEP20 address.</p>

      <h3>Before You Start</h3>
      <p>Make sure you have:</p>
      <ul>
        <li>A <strong>whitelisted withdrawal address</strong> (set in Wallet → Withdrawal Whitelist).</li>
        <li><strong>2FA enabled</strong> on your account.</li>
        <li>Sufficient balance in your <strong>Earnings Wallet</strong> (withdrawals cannot come from the Funded Wallet).</li>
        <li>No active <strong>moratorium</strong> (72-hour hold after changing your address).</li>
      </ul>

      <h3>Step 1: Open Withdrawal</h3>
      <p>Tap <strong>Withdraw</strong> from Quick Actions or go to Wallet → Withdraw.</p>

      <h3>Step 2: Enter Amount</h3>
      <ul>
        <li>Minimum: <strong>10 USDT</strong>.</li>
        <li>Maximum: <strong>10,000 USDT</strong> (subject to daily limits).</li>
        <li>The fee and the net amount you will receive are shown before confirmation.</li>
      </ul>

      <h3>Step 3: Verify Your Identity</h3>
      <p>You must provide:</p>
      <ol>
        <li><strong>Email OTP</strong> — a 6-digit code sent to your registered email.</li>
        <li><strong>2FA Code</strong> — the 6-digit code from your authenticator app.</li>
      </ol>

      <h3>Step 4: Confirm & Submit</h3>
      <p>Review the summary (amount, fee, destination address) and tap <strong>Confirm Withdrawal</strong>.</p>

      <h3>Step 5: Processing</h3>
      <p>Withdrawals require <strong>admin approval</strong> and are typically processed within <strong>1–24 hours</strong>. Small amounts below a certain threshold may be processed instantly.</p>

      <h3>Daily Limits</h3>
      <p>There is a daily withdrawal limit to protect all users. If you reach the limit, you will need to wait until the next day.</p>

      <h3>Common Errors</h3>
      <ul>
        <li><strong>"Withdrawal Address Required"</strong> — Set your address first in Wallet → Withdrawal Whitelist.</li>
        <li><strong>"Address Moratorium Active"</strong> — Wait for the 72-hour hold to expire.</li>
        <li><strong>"Insufficient Funds"</strong> — Your Earnings Wallet balance is too low.</li>
        <li><strong>"Daily Withdrawal Limit Reached"</strong> — Try again tomorrow.</li>
        <li><strong>"Invalid Email OTP" / "2FA Code Invalid"</strong> — Re-check your email or authenticator app and try again.</li>
      </ul>
    `,
  },
  {
    id: 'transfer-step-by-step',
    title: 'P2P Transfers: Step-by-Step',
    description:
      'How to send USDT to another Novunt user — finding recipients, verification, and instant delivery.',
    category: 'wallets-finance',
    readTime: 5,
    tags: ['Transfer', 'P2P', 'Send', 'Free', 'Instant'],
    content: `
      <h2>Transfer Walkthrough</h2>
      <p>P2P (peer-to-peer) transfers let you send USDT from your <strong>Earnings Wallet</strong> to another Novunt user. Transfers are <strong>free</strong> and <strong>instant</strong>.</p>

      <h3>Step 1: Open Transfer</h3>
      <p>Tap <strong>Transfer</strong> from the dashboard Quick Actions or navigate to Wallet → Transfer.</p>

      <h3>Step 2: Find the Recipient</h3>
      <p>Search for the recipient using any of these:</p>
      <ul>
        <li><strong>Email address</strong> — their registered Novunt email.</li>
        <li><strong>Username</strong> — their Novunt username.</li>
        <li><strong>User ID</strong> — their unique account ID.</li>
      </ul>
      <p>You can also select from <strong>Past Recipients</strong> if you have previously sent to them.</p>

      <h3>Step 3: Enter Amount & Memo</h3>
      <ul>
        <li>Enter the amount to send (minimum applies, shown on screen).</li>
        <li>Optionally add a <strong>memo</strong> (up to 200 characters) — a note the recipient will see.</li>
        <li>Fee: <strong>$0.00 (FREE)</strong>.</li>
      </ul>

      <h3>Step 4: Verify</h3>
      <p>Both verification steps are required:</p>
      <ol>
        <li><strong>Email OTP</strong> — enter the 6-digit code sent to your email.</li>
        <li><strong>2FA Code</strong> — enter the 6-digit code from your authenticator app.</li>
      </ol>

      <h3>Step 5: Confirm</h3>
      <p>Review the transfer details and tap <strong>Confirm Transfer</strong>. The transfer is processed instantly. The recipient sees the funds in their Funded Wallet immediately.</p>

      <h3>Key Facts</h3>
      <ul>
        <li>Source: <strong>Earnings Wallet only</strong> (you cannot transfer from the Funded Wallet).</li>
        <li>Cost: <strong>Free</strong> — no fees.</li>
        <li>Speed: <strong>Instant</strong>.</li>
        <li>Recipients receive funds in their <strong>Funded Wallet</strong> (not Earnings Wallet).</li>
      </ul>
    `,
  },

  // ──────────── Earning Systems (new batch) ────────────
  {
    id: 'pools-explained',
    title: 'Performance & Premium Pools Explained',
    description:
      'How the two reward pools work, qualification requirements by rank, and how distributions are calculated.',
    category: 'earning-systems',
    readTime: 7,
    tags: ['Pools', 'Performance', 'Premium', 'Rank', 'Rewards'],
    content: `
      <h2>Two Reward Pools</h2>
      <p>Novunt distributes additional earnings through two pools: the <strong>Performance Pool</strong> and the <strong>Premium Pool</strong>. These are on top of your regular ROS payouts.</p>

      <h3>Performance Pool</h3>
      <p>The Performance Pool rewards users based on their overall contribution to the platform. Qualification is determined by a weighted score:</p>
      <ul>
        <li><strong>Personal Stake</strong> — 1x weight.</li>
        <li><strong>Team Stake</strong> — 7x weight.</li>
        <li><strong>Direct Downlines</strong> — 2x weight.</li>
      </ul>
      <p>To be eligible, you must hold at least the rank of <strong>Associate Stakeholder</strong>. Stakeholders (the base rank) are not eligible for pool distributions.</p>

      <h3>Premium Pool</h3>
      <p>The Premium Pool is an exclusive pool for higher-ranked members who meet additional downline requirements. Each rank has specific requirements for the number and stake size of lower-ranked team members:</p>
      <table>
        <tr><td><strong>Rank</strong></td><td><strong>Required Lower-Rank</strong></td><td><strong>Stake Requirement</strong></td></tr>
        <tr><td>Associate Stakeholder</td><td>Stakeholder</td><td>$50+ stake each</td></tr>
        <tr><td>Principal Strategist</td><td>Associate Stakeholder</td><td>$50+ stake each</td></tr>
        <tr><td>Elite Capitalist</td><td>Principal Strategist</td><td>$100+ stake each</td></tr>
        <tr><td>Wealth Architect</td><td>Elite Capitalist</td><td>$250+ stake each</td></tr>
        <tr><td>Finance Titan</td><td>Wealth Architect</td><td>$500+ stake each</td></tr>
      </table>

      <h3>Viewing Your Pool Status</h3>
      <p>Navigate to <strong>Rank & Pools</strong> from the sidebar. The page has two tabs:</p>
      <ul>
        <li><strong>Rank & Qualification</strong> — your current rank, progress toward the next rank, and pool eligibility badges (green = qualified, grey = not eligible).</li>
        <li><strong>Pool Distributions</strong> — history of all pool payouts, filterable by All, Performance, or Premium.</li>
      </ul>
    `,
  },

  // ──────────── Ranks & Teams (new batch) ────────────
  {
    id: 'rank-system-detailed',
    title: 'The Six Ranks: Requirements & Benefits',
    description:
      'A detailed breakdown of all six Novunt ranks, what is needed to reach each one, and the benefits they unlock.',
    category: 'ranks-teams',
    readTime: 6,
    tags: ['Ranks', 'Progression', 'Requirements', 'Benefits'],
    content: `
      <h2>Novunt Rank System</h2>
      <p>Novunt has six ranks. Every user starts as a <strong>Stakeholder</strong> and can climb by growing their personal stake, team stake, and active downlines.</p>

      <h3>The Six Ranks</h3>
      <ol>
        <li><strong>Stakeholder</strong> — the starting rank for all users.</li>
        <li><strong>Associate Stakeholder</strong> — unlocks Performance Pool eligibility.</li>
        <li><strong>Principal Strategist</strong> — higher pool shares and team recognition.</li>
        <li><strong>Elite Capitalist</strong> — access to the Premium Pool.</li>
        <li><strong>Wealth Architect</strong> — elevated pool distributions.</li>
        <li><strong>Finance Titan</strong> — the highest rank with maximum benefits.</li>
      </ol>

      <h3>Rank Requirements</h3>
      <p>Each rank above Stakeholder requires meeting thresholds in four areas:</p>
      <ul>
        <li><strong>Personal Stake</strong> — the total amount you have personally staked.</li>
        <li><strong>Team Stake</strong> — the combined stake volume of your entire team (all levels).</li>
        <li><strong>Direct Downlines</strong> — the number of Level 1 referrals with qualifying stakes.</li>
        <li><strong>Lower-Rank Downlines</strong> — for higher ranks, you need team members who have achieved specific ranks themselves.</li>
      </ul>
      <p>Your progress toward each requirement is displayed as a percentage on the <strong>Rank & Pools</strong> page. When all four reach 100%, you are promoted automatically.</p>

      <h3>Benefits of Higher Ranks</h3>
      <ul>
        <li>Access to the <strong>Performance Pool</strong> (from Associate Stakeholder).</li>
        <li>Access to the <strong>Premium Pool</strong> (higher ranks with qualifying downlines).</li>
        <li>Higher <strong>pool share percentages</strong>.</li>
        <li><strong>Rank bonuses</strong> distributed when you reach a new rank.</li>
        <li><strong>NXP rewards</strong> for rank achievements.</li>
        <li>Greater visibility and recognition within the Novunt community.</li>
      </ul>

      <h3>Viewing Your Rank</h3>
      <p>Tap the <strong>Rank</strong> button on your dashboard or navigate to <strong>Rank & Pools</strong> from the sidebar. The page shows your current rank, progress toward the next rank, and pool qualification status.</p>
    `,
  },

  // ──────────── Getting Started (new batch) ────────────
  {
    id: 'trading-signals-guide',
    title: 'Trading Signals: What They Are & How to Read Them',
    description:
      "Understanding Novunt's live trading signals — market types, direction, profitability, and how to use the signals page.",
    category: 'getting-started',
    readTime: 5,
    tags: ['Trading', 'Signals', 'Forex', 'Crypto', 'Markets'],
    content: `
      <h2>What Are Trading Signals?</h2>
      <p>Novunt provides live trading signals — verified records of market positions across multiple asset classes. These signals give you transparency into market activity and can help you understand how returns are generated.</p>

      <h3>Markets Covered</h3>
      <ul>
        <li><strong>Forex</strong> — currency pairs (EUR/USD, GBP/USD, etc.).</li>
        <li><strong>Crypto</strong> — digital assets (BTC/USDT, ETH/USDT, etc.).</li>
        <li><strong>Metals</strong> — gold, silver, and other precious metals.</li>
        <li><strong>Commodities</strong> — oil, natural gas, and other resources.</li>
      </ul>

      <h3>Signal Information</h3>
      <p>Each signal shows:</p>
      <ul>
        <li><strong>Symbol</strong> — the asset being traded.</li>
        <li><strong>Direction</strong> — LONG (expecting price to go up) or SHORT (expecting price to go down).</li>
        <li><strong>Entry / Exit Price</strong> — where the position was opened and closed.</li>
        <li><strong>Profit/Loss</strong> — in USD and pips/points.</li>
        <li><strong>Duration</strong> — how long the position was held.</li>
        <li><strong>Status</strong> — profitable (green) or loss (red).</li>
      </ul>

      <h3>Using the Signals Page</h3>
      <p>Navigate to <strong>Trading Signals</strong> from the sidebar. You can:</p>
      <ul>
        <li>View <strong>24-hour</strong> or <strong>7-day</strong> history.</li>
        <li>Filter by <strong>market type</strong>, <strong>profitable only</strong>, or <strong>day trades only</strong>.</li>
        <li>Search by symbol name.</li>
        <li>See overall stats: total signals, profitable count, win rate, and total profit.</li>
      </ul>
      <p>The signals page displays up to <strong>100 days</strong> of verified trading history.</p>

      <h3>Important Note</h3>
      <p>Trading signals are provided for <strong>informational and transparency purposes only</strong>. They are not investment advice. Past performance does not guarantee future results.</p>
    `,
  },
  {
    id: 'social-media-verification',
    title: 'Social Media Verification Guide',
    description:
      'Step-by-step instructions for verifying your social media accounts on all five platforms to complete your registration bonus.',
    category: 'getting-started',
    readTime: 4,
    tags: ['Social Media', 'Verification', 'Facebook', 'Instagram', 'TikTok'],
    content: `
      <h2>Why Verify Social Media?</h2>
      <p>Social media verification is Step 4 of the five registration bonus steps. Completing it earns you 20% progress toward your 10% welcome bonus. You must follow Novunt's official account on all five platforms.</p>

      <h3>The Five Platforms</h3>
      <ol>
        <li><strong>Facebook</strong></li>
        <li><strong>Instagram</strong></li>
        <li><strong>YouTube</strong></li>
        <li><strong>TikTok</strong></li>
        <li><strong>Telegram</strong></li>
      </ol>

      <h3>How to Verify Each Platform</h3>
      <ol>
        <li>Open the <strong>Freebies</strong> section from your dashboard.</li>
        <li>Find the <strong>Social Media</strong> step.</li>
        <li>Tap the icon for the platform you want to verify.</li>
        <li>Novunt opens the platform in a <strong>new browser tab</strong>.</li>
        <li><strong>Follow</strong> or <strong>subscribe</strong> to Novunt's official account on that platform.</li>
        <li>Return to Novunt and tap <strong>Confirm</strong>.</li>
        <li>A green checkmark appears when verification is successful.</li>
      </ol>
      <p>Repeat for all five platforms. The step is complete only when all five are verified.</p>

      <h3>Tips</h3>
      <ul>
        <li>Make sure you are logged into the correct social media account before following.</li>
        <li>If verification fails, try opening the link again and re-following.</li>
        <li>You can verify the platforms in any order.</li>
        <li>Once verified, a platform stays verified — you do not need to re-verify later.</li>
      </ul>
    `,
  },

  // ──────────── Security & Account (new batch) ────────────
  {
    id: 'notifications-guide',
    title: 'Understanding Notifications',
    description:
      'How the notification system works — types, filtering, and managing alerts on the Novunt platform.',
    category: 'security-account',
    readTime: 4,
    tags: ['Notifications', 'Alerts', 'Updates', 'Bell Icon'],
    content: `
      <h2>Notification Center</h2>
      <p>Novunt keeps you informed about everything happening with your account through the notification system. Access it by tapping the <strong>bell icon</strong> in the top navigation bar.</p>

      <h3>Notification Types</h3>
      <ul>
        <li><strong>Deposit</strong> — your deposit has been confirmed.</li>
        <li><strong>Withdrawal</strong> — your withdrawal has been processed or requires attention.</li>
        <li><strong>Earning</strong> — ROS payouts have been credited to your Earnings Wallet.</li>
        <li><strong>Bonus</strong> — registration bonus, rank bonus, or other bonuses activated or paid.</li>
        <li><strong>Referral</strong> — a referral has signed up, staked, or earned a commission for you.</li>
        <li><strong>Security</strong> — login alerts, 2FA changes, or account security events.</li>
        <li><strong>Alert</strong> — important warnings that require your attention.</li>
        <li><strong>System</strong> — platform updates, maintenance notices, or feature announcements.</li>
        <li><strong>Info / Success</strong> — general informational messages and confirmations.</li>
      </ul>

      <h3>Filtering Notifications</h3>
      <p>The notification panel has two tabs:</p>
      <ul>
        <li><strong>All Notifications</strong> — everything in chronological order.</li>
        <li><strong>System & Alerts</strong> — filtered to show only system, security, alert, bonus, referral, and info notifications.</li>
      </ul>

      <h3>Managing Notifications</h3>
      <ul>
        <li>Unread notifications are highlighted and counted in the badge on the bell icon.</li>
        <li>Tap a notification to mark it as read.</li>
        <li>Use <strong>Mark All as Read</strong> to clear all unread badges at once.</li>
        <li>Delete individual notifications you no longer need.</li>
      </ul>

      <h3>Notification Preferences</h3>
      <p>In <strong>Settings → Notifications</strong>, you can toggle:</p>
      <ul>
        <li>Email Notifications</li>
        <li>SMS Notifications</li>
        <li>Referral Notifications</li>
        <li>Deposit Alerts</li>
      </ul>
    `,
  },
  {
    id: 'theme-customization',
    title: 'Theme & Display Settings',
    description:
      'How to switch between Light, Dark, and System themes on Novunt.',
    category: 'security-account',
    readTime: 2,
    tags: ['Theme', 'Dark Mode', 'Light Mode', 'Display'],
    content: `
      <h2>Choosing Your Theme</h2>
      <p>Novunt supports three display modes to match your preference and environment.</p>

      <h3>Available Themes</h3>
      <ul>
        <li><strong>Light</strong> — a bright, clean interface for daytime use.</li>
        <li><strong>Dark</strong> — a darker palette that reduces eye strain in low-light conditions.</li>
        <li><strong>System</strong> — automatically follows your device's theme setting (the default).</li>
      </ul>

      <h3>How to Change Your Theme</h3>
      <ol>
        <li>Tap the <strong>theme toggle</strong> icon in the top navigation bar (sun/moon icon).</li>
        <li>Select <strong>Light</strong>, <strong>Dark</strong>, or <strong>System</strong> from the dropdown.</li>
        <li>The change applies instantly across the entire platform.</li>
      </ol>
      <p>You can also change the theme from <strong>Settings → Personal → Theme</strong>.</p>
    `,
  },

  // ──────────── Staking & Goals (new batch) ────────────
  {
    id: 'ros-calendar-explained',
    title: 'The ROS Calendar: Tracking Daily Returns',
    description:
      'How to read the ROS Calendar card on your dashboard and understand your daily profit distribution.',
    category: 'staking-goals',
    readTime: 4,
    tags: ['ROS', 'Calendar', 'Daily Profit', 'Returns'],
    content: `
      <h2>What Is the ROS Calendar?</h2>
      <p>The ROS (Return on Stake) Calendar is a visual card on your dashboard that shows your daily profit distribution for the current month.</p>

      <h3>Reading the Calendar</h3>
      <ul>
        <li>Each day of the month is shown in a grid layout (Sunday through Saturday).</li>
        <li><strong>Past days</strong> show a blue bar whose height represents the ROS percentage earned that day.</li>
        <li><strong>Today</strong> is highlighted in orange so you can quickly find it.</li>
        <li><strong>Future days</strong> are empty/greyed out.</li>
        <li>The <strong>month header</strong> shows "Month to Date" and the total accumulated ROS percentage for the current month.</li>
      </ul>

      <h3>How ROS Works</h3>
      <p>Your active stakes generate returns that are distributed to your Earnings Wallet. The ROS Calendar visualizes this activity day by day, so you can see patterns and track consistency.</p>

      <h3>Tips</h3>
      <ul>
        <li>A consistent calendar with daily entries means your stakes are actively earning.</li>
        <li>Gaps may appear if you had no active stakes on certain days.</li>
        <li>The daily ROS rate is configured by the platform and distributed across your active stakes each day.</li>
      </ul>
    `,
  },

  // ──────────── Earning Systems (new batch) ────────────
  {
    id: 'achievements-badges',
    title: 'Achievements & Badge System',
    description:
      'How the badge and achievement system works — earning NXP, badge rarities, the leaderboard, and tracking your progress.',
    category: 'earning-systems',
    readTime: 5,
    tags: ['Achievements', 'Badges', 'NXP', 'Leaderboard', 'Rewards'],
    content: `
      <h2>Achievements Page</h2>
      <p>Navigate to <strong>Achievements</strong> from the sidebar to see your badges, NXP balance, and leaderboard position.</p>

      <h3>What Are Badges?</h3>
      <p>Badges are visual achievements you unlock by reaching specific milestones on the platform. Each badge comes with an NXP reward. Badges have four rarity levels:</p>
      <ul>
        <li><strong>Common</strong> — easy to earn; basic milestones.</li>
        <li><strong>Rare</strong> — requires more effort; intermediate goals.</li>
        <li><strong>Epic</strong> — significant achievements; advanced milestones.</li>
        <li><strong>Legendary</strong> — the most prestigious; only top users earn these.</li>
      </ul>

      <h3>NXP Sources</h3>
      <p>NXP (Novunt Experience Points) can come from multiple sources:</p>
      <ul>
        <li><strong>Badges</strong> — earned when you unlock a badge.</li>
        <li><strong>Ranks</strong> — awarded when you reach a new rank.</li>
        <li><strong>Milestones</strong> — special milestone achievements (streaks, total staked, etc.).</li>
        <li><strong>Activities</strong> — regular platform activity (deposits, stakes, referrals).</li>
        <li><strong>Bonuses</strong> — special promotions or campaigns.</li>
      </ul>
      <p>Your NXP breakdown (from badges, ranks, milestones, and activities) is shown in the NXP Overview section.</p>

      <h3>The Leaderboard</h3>
      <p>The NXP Leaderboard ranks all Novunt users by total NXP earned. Check it to see where you stand in the community. Climbing the leaderboard is a great motivator and demonstrates your commitment to the platform.</p>

      <h3>NXP History</h3>
      <p>Every NXP transaction is recorded. View your full NXP History to see when and how you earned each point.</p>
    `,
  },

  // ──────────── Glossary (new batch) ────────────
  {
    id: 'community-channels',
    title: 'Novunt Community & Social Channels',
    description:
      'All the official Novunt social media channels, community groups, and how to stay connected.',
    category: 'glossary',
    readTime: 3,
    tags: ['Community', 'Social', 'Telegram', 'Facebook', 'Instagram'],
    content: `
      <h2>Stay Connected</h2>
      <p>Novunt has an active community across multiple platforms. Follow us to stay updated on announcements, tips, and events.</p>

      <h3>Official Channels</h3>
      <ul>
        <li><strong>Telegram</strong> — Join the main community group for discussions and updates.</li>
        <li><strong>Facebook</strong> — Follow for announcements, educational content, and community highlights.</li>
        <li><strong>Instagram</strong> — Visual updates, tips, and behind-the-scenes content.</li>
        <li><strong>YouTube</strong> — Tutorials, guides, and platform walkthroughs.</li>
        <li><strong>TikTok</strong> — Short-form content, tips, and community challenges.</li>
      </ul>

      <h3>Why Join?</h3>
      <ul>
        <li>Be the first to know about new features and updates.</li>
        <li>Get tips from experienced community members.</li>
        <li>Participate in promotional campaigns and events.</li>
        <li>Following all 5 platforms is part of the registration bonus steps.</li>
      </ul>

      <h3>Community Button</h3>
      <p>Tap the <strong>Community</strong> button on your dashboard to quickly access the Team page and your referral network.</p>
    `,
  },
];

/**
 * Get articles by category
 */
export function getArticlesByCategory(categoryId: string): Article[] {
  return knowledgeBaseArticles.filter(
    (article) => article.category === categoryId
  );
}

/**
 * Get article by ID
 */
export function getArticleById(articleId: string): Article | undefined {
  return knowledgeBaseArticles.find((article) => article.id === articleId);
}

/**
 * Search articles by query
 */
export function searchArticles(query: string): Article[] {
  const lowerQuery = query.toLowerCase();
  return knowledgeBaseArticles.filter(
    (article) =>
      article.title.toLowerCase().includes(lowerQuery) ||
      article.description.toLowerCase().includes(lowerQuery) ||
      article.tags?.some((tag) => tag.toLowerCase().includes(lowerQuery))
  );
}
