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
        <li>Choose your preferred network (BEP20 or TRC20)</li>
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
        <li>Make a deposit via BEP20 or TRC20 network</li>
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
      'Complete guide to depositing USDT via BEP20 or TRC20 networks, limits, and security notes.',
    category: 'wallets-finance',
    readTime: 7,
    tags: ['Deposit', 'Funding', 'Security'],
    content: `
      <h2>How to Deposit Funds to Novunt</h2>
      <p>This guide explains everything you need to know about depositing USDT to your Novunt account safely and efficiently.</p>
      
      <h3>Supported Networks</h3>
      <p>Novunt accepts USDT (Tether) deposits via two blockchain networks:</p>
      <ul>
        <li><strong>BEP20 (Binance Smart Chain):</strong> Lower transaction fees, faster confirmations</li>
        <li><strong>TRC20 (Tron Network):</strong> Very low fees, fast transactions</li>
      </ul>
      <p><strong>Important:</strong> Only send USDT. Do not send other cryptocurrencies, as they may be lost.</p>
      
      <h3>Step-by-Step Deposit Process</h3>
      <ol>
        <li><strong>Navigate to Wallets:</strong> Go to the Wallets section from the main navigation</li>
        <li><strong>Click Deposit:</strong> Select the "Deposit" button in your Deposit Wallet card</li>
        <li><strong>Choose Network:</strong> Select either BEP20 or TRC20 based on your preference</li>
        <li><strong>Copy Address:</strong> Copy the wallet address displayed (or scan the QR code)</li>
        <li><strong>Send from External Wallet:</strong> Paste the address in your external wallet and send USDT</li>
        <li><strong>Wait for Confirmation:</strong> Transactions typically confirm within 5-30 minutes</li>
        <li><strong>Funds Appear:</strong> Once confirmed, funds will appear in your Deposit Wallet</li>
      </ol>
      
      <h3>Deposit Limits</h3>
      <p>Novunt may have minimum and maximum deposit limits:</p>
      <ul>
        <li><strong>Minimum Deposit:</strong> Typically $10-50 USDT (varies by network)</li>
        <li><strong>Maximum Deposit:</strong> May vary based on account verification level</li>
        <li><strong>Daily Limits:</strong> Check your account dashboard for current limits</li>
      </ul>
      <p>Limits are subject to change and may vary based on your account status and verification level.</p>
      
      <h3>Transaction Fees</h3>
      <p>Novunt does not charge deposit fees. However, network fees apply:</p>
      <ul>
        <li><strong>BEP20:</strong> Network fees typically $0.10-1.00</li>
        <li><strong>TRC20:</strong> Network fees typically $0.01-0.50</li>
      </ul>
      <p>These fees are paid to the blockchain network, not to Novunt.</p>
      
      <h3>Security Best Practices</h3>
      <ul>
        <li><strong>Double-Check Address:</strong> Always verify the wallet address before sending</li>
        <li><strong>Use QR Codes:</strong> Scan QR codes when possible to avoid typing errors</li>
        <li><strong>Network Matching:</strong> Ensure your external wallet uses the same network (BEP20 or TRC20)</li>
        <li><strong>Test Transaction:</strong> For large amounts, consider sending a small test amount first</li>
        <li><strong>Secure Your Wallet:</strong> Keep your external wallet credentials secure</li>
        <li><strong>Wait for Confirmations:</strong> Don't send multiple transactions until the first one confirms</li>
      </ul>
      
      <h3>Common Issues & Solutions</h3>
      <h4>Funds Not Appearing</h4>
      <ul>
        <li>Check that enough blockchain confirmations have occurred (usually 12-20)</li>
        <li>Verify you sent USDT, not another cryptocurrency</li>
        <li>Ensure you used the correct network (BEP20 or TRC20)</li>
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
        <li><strong>Choose Network:</strong> Select BEP20 or TRC20 network</li>
        <li><strong>Enter Address:</strong> Paste your external wallet address (double-check it!)</li>
        <li><strong>Note:</strong> If you recently changed your wallet address, remember there's a 48-hour moratorium before the new address becomes active for withdrawals</li>
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
        <li><strong>Network Fee:</strong> Paid to blockchain network (BEP20/TRC20)</li>
        <li><strong>Total Cost:</strong> 3% platform fee + network fee deducted from withdrawal amount</li>
      </ul>
      <p><strong>Fee Calculation Example:</strong> If you withdraw $100, the platform fee is $3 (3%), plus the network fee. The network fee varies based on the blockchain network chosen (BEP20 or TRC20).</p>
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
        <li><strong>Network Matching:</strong> Ensure your external wallet supports the selected network</li>
        <li><strong>Enable 2FA:</strong> Add an extra layer of security to your account</li>
        <li><strong>Wallet Address Changes:</strong> Remember that changing your withdrawal address requires a 48-hour moratorium before it becomes active</li>
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
        <li><strong>2FA for Large Stakes:</strong> Two-factor authentication (2FA) is required when creating stakes of $500 or more</li>
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
        <li><strong>Enable 2FA:</strong> Enable 2FA before creating stakes of $500 or more to avoid delays</li>
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
      <p>Each stake shows its progress from 100% (initial amount) to 200% (doubled), with ROS contributing to this growth.</p>
      
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
        <li><strong>48-Hour Moratorium:</strong> When you change your withdrawal wallet address, there is a 48-hour waiting period before the new address becomes active</li>
        <li><strong>Security Purpose:</strong> This moratorium prevents unauthorized changes and gives you time to detect and report any suspicious activity</li>
        <li><strong>During Moratorium:</strong> Withdrawals will continue to use your previous wallet address until the 48-hour period expires</li>
        <li><strong>Notification:</strong> You'll receive notifications about the address change and when it becomes active</li>
        <li><strong>Cancel Option:</strong> If the change was unauthorized, you can contact support during the moratorium period to cancel it</li>
      </ul>
      <p><strong>Why This Matters:</strong> The 48-hour moratorium protects you from hackers who might gain access to your account and try to change your withdrawal address to steal your funds. Always monitor your account for unexpected address changes.</p>
      
      <h3>Additional Security Features</h3>
      <p>Novunt may offer additional security features:</p>
      <ul>
        <li><strong>Login Notifications:</strong> Email alerts for new logins</li>
        <li><strong>Transaction Confirmations:</strong> Require confirmation for sensitive actions</li>
        <li><strong>IP Restrictions:</strong> Limit access to specific IP addresses</li>
        <li><strong>Activity Logs:</strong> Review account activity history</li>
        <li><strong>Wallet Address Change Moratorium:</strong> 48-hour waiting period for wallet address changes</li>
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
        <li>Check that you used the correct network (BEP20 or TRC20)</li>
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
        <li>Blockchain network fees apply (BEP20/TRC20)</li>
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
        <li>Use the Novunt Assistant (floating chat icon)</li>
        <li>Send an email to support (check platform for address)</li>
        <li>Check if there's a support ticket system</li>
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
