const parseDuration = require('parse-duration');

const FINALIZE_TYPE = {
  OPEN: 'open',
  OWN: 'own',
  SHARE: 'share',
};

const SUBSCRIPTION = {
  FREE: 'free',
  INDIVIDUAL: 'individual',
  INDIVIDUAL_TOP: 'individualTop',
  COMPANY: 'company',
  COMPANY_TOP: 'companyTop',
};

const SIGN_STATUS = {
  PREPARE: 'prepare',
  SIGNED: 'completed',
};

const PAY_STATUS = {
  PREPARE: 'prepare',
  PENDING: 'pending',
  PAYED: 'payed',
  FAILED: 'failed',
};

const POPULATE_FIELDS = {
  PROBLEM: {
    path: 'parentProduct',
    model: 'CompanyProduct',
  },
  SOLUTION: {
    path: 'problem',
    model: 'Problem',
  },
  APPLICATION: [
    {
      path: 'problems',
      model: 'Problem',
    },
    {
      path: 'selected',
      model: 'Solution',
    },
  ],
  COMPANY_PRODUCT: {
    path: 'company',
    model: 'Tag',
  },
};

const rewardType = {
  APP_PAY: 'app-pay',
  SHARE_FB: 'share-fb',
  SHARE_LN: 'share-ln',
  SHARE_TW: 'share-tw',
  SHARE_IN: 'share-in',
  SHARE_WA: 'share-wa',
  SHARE_RB: 'share-rb',
  SHARE_TT: 'share-tt',
  NFT_DEPLOY: 'nft-deploy',
  NFT_DEPLOY_MM: 'nft-deploy-mm',
  SOLUTION_IMPROVE: 'solution-improve',
  SOLUTION_CREATE: 'solution-create',
  APP_IMPROVE: 'app-improve',
  CONTEST_WIN: 'contest-win',
  CONTEST_OWNER_WIN: 'contest-owner-win',
  CHALLENGE_WIN: 'challenge-win',
};

const rewardResource = {
  PROBLEM: 'problem',
  SOLUTION: 'solution',
  APPLICATION: 'application',
  PRODUCT: 'product',
  CONTEST: 'contest',
  CHALLENGE: 'challenges',
  TAG: 'tags',
  PROFILE: 'profiles',
};

const filters = {
  IS_FILED: 'filedOnly',
};

const activityItem = rewardResource;

const activityAction = {
  CREATE: 'create',
  DRAFT: 'draft',
  SHARE: 'share',
  LIKE: 'voteLike',
  DISLIKE: 'voteDislike',
  SOLVE: 'solve',
  IMPROVE: 'improve',
  ADD_CONTEST_SOLUTION: 'addContestSolution',
};

const voteType = {
  LIKE: 1,
  DISLIKE: -1,
  REVERT: 0,
};

const signDocType = {
  PUBLIC_SOLUTION: 'publicSolution',
  APPLICATION_BUY: 'applicationBuy',
  APPLICATION_FILL: 'applicationFill',
  EXCLUSIVE_APPLICATION: 'exclusiveApplication',
  SHARED_APPLICATION: 'sharedApplication',
  UNKNOWN: 'unknownApplication',
};

const termsTemplateType = {
  REGISTRATION: 'registration',
  PUBLIC_SOLUTION: 'publicSolution',
  EXCLUSIVE_APPLICATION: 'exclusiveApplication',
  SHARED_APPLICATION: 'sharedApplication',
  APPLICATION_FILL: 'applicationFill',
};

const TAG_TYPES = {
  LOCATION: 'location',
  TAG: 'tag',
  UNIVERSITY: 'university',
  WORKPLACE: 'workplace',
};

const STRIPE_EVENTS = {
  CHECKOUT_SESSION_COMPLETED: 'checkout.session.completed',
};
const patentApplication = {
  FIGURE_DESCRIPTION: `This figure displays a graphic with the word "EXAMPLE" written in bold, distressed, dark blue capital letters. The text is enclosed within a similarly styled rectangular border, giving the appearance of a stamped imprint. The rectangle is slightly tilted to the right, adding a dynamic and informal touch to the graphic. The background features a checkerboard pattern, indicating transparency in image editing software. This figure likely serves as a placeholder or sample image, commonly used in templates, mockups, and examples to demonstrate where content should be inserted or how it should be formatted. It does not present any specific data or trends, but rather indicates a prototype status for illustrative purposes.`,
  INVENTION_SUMMARY: `While preferred embodiments of the present invention have been shown and described herein, it will be obvious to those skilled in the art that such embodiments are provided by way of example only. It is not intended that the invention be limited by the specific examples provided within the specification. While the invention has been described with reference to the aforementioned specification, the descriptions and illustrations of the embodiments herein are not meant to be construed in a limiting sense. Numerous variations, changes, and substitutions will now occur to those skilled in the art without departing from the invention. Furthermore, it shall be understood that all aspects of the invention are not limited to the specific depictions, configurations or relative proportions set forth herein which depend upon a variety of conditions and variables. It should be understood that various alternatives to the embodiments of the invention described herein may be employed in practicing the invention. It is therefore contemplated that the invention shall also cover any such alternatives, modifications, variations or equivalents. It is intended that the following claims define the scope of the invention and that methods and structures within the scope of these claims and their equivalents be covered thereby.`,
};
const PAYMENT_STATUS = {
  APPROVED: 'approved',
  CANCELLED: 'cancelled',
};

const EXCLUSIVE_CANCEL_TIME = parseDuration(
  process.env.EXCLUSIVITY_BUY_TIMEOUT,
);

const COMMON = {
  ACTIVE: 'active',
  ADMINS: 'admins',
  ALL: 'all',
  APPLICATION_MONGOOSE_DAL: 'ApplicationMongooseDal',
  APPLICATION: 'application',
  APPROVERS: 'approvers',
  C_APPLICATION: 'Application',
  C_CONTEST: 'Contest',
  C_PROBLEM: 'Problem',
  C_PROFILE: 'Profile',
  C_SOLUTION: 'Solution',
  C_SOLUTIONS: 'Solutions',
  CHILDREN_ID: 'children.id',
  CLAIM_REWARD_SUBJECT: 'Your MindMiner Royalty Distribution',
  COMMUNITY_EMPLOYEE: 'communityemployee',
  COMMUNITY_MEMBERS: 'Community Members',
  COMMUNITY: 'community',
  CONCEPT_PROBLEM: 'conceptProblem',
  CONCEPT_SOLUTION: 'conceptSolution',
  CONTEST_WINNER: 'contest-winner',
  CONTEST: 'contest',
  CONTESTENDNOTIFICATION: 'ContestEndNotification',
  CREATE: 'create',
  CREATED_PROBLEM: 'created problem',
  CREATED_SOLUTION: 'created solution',
  CURRENT_TAB: 'currentTab',
  DISLIKE: 'dislike',
  DRAFT: 'draft',
  EARN_IDEACOINS: 'Earn IdeaCoins and create Idea #NFTs by',
  EMAIL: 'email',
  EMPTY_STRING: '',
  FEW_MORE_MOMENTS: 'Just few more moments...',
  FEW_MORE_MOMENTS: 'Just wait few moments...',
  FILES: 'files',
  FILTER_TYPE: 'filterType',
  FIND_ONE_AND_UPDATE: 'findOneAndUpdate',
  FIND_ONE: 'findOne',
  FIND: 'find',
  FOLLOW: 'follow',
  FOLLOWERS: '$followers',
  JWT_IAT: 2592000,
  IDEA_REWARD_DISTRIBUTED: 'Idea reward distributed successfully',
  IDEAPOINTS: 'ideaPoints',
  IMPROVE_PROBLEM: 'problem-improve',
  IMPROVE_SOLUTION: 'solution-improve',
  IMPROVED_PROBLEM: 'improved problem',
  IMPROVED_SOLUTION: 'improved solution',
  IMAGE_FROM_URL : 'image_from_url',
  INFO: 'info',
  INVITE: 'invite',
  IS_ARCHIVED: 'isArchived',
  ITEM_ID: 'itemId',
  ITEM_ID_OWNER: 'itemId.owner',
  KEY: 'key',
  L_Tag: 'tag',
  LAWYERS: 'lawyers',
  LIKE: 'like',
  LIKES: 'likes',
  LOCAL_MEMBERS: 'Local Members',
  LOCAL: 'local',
  MATIC_REWARD_DISTRIBUTED: 'MATIC reward distributed',
  NAME: 'name',
  NO_EMAIL: 'No Email',
  NEW_EMP_EMAIL_SENT: 'New Employee Email Sent.',
  NEW_COMMUNITY_EMPLOYEE_SUBJECT:
    'Welcome to MindMiner! Your Profile Has Been Created',
  ON_MINDMINER: 'on MindMiner',
  OWNER: 'owner',
  PARENT_PRODUCT: 'parentProduct',
  PASSED: 'passed',
  PATENT_PENDING_SOLUTION: 'solution-patent-pending',
  PATENT_PENDING: 'patent-pending',
  PROBLEM: 'problem',
  PRODUCT: 'product',
  C_TIMER: 'Timer',
  PROFILE: 'profile',
  PROFILES: 'profiles',
  PROMOT_IDS: 'promptIds',
  PURCHASED_PATENT_SOLUTION: 'solution-purchased-patent',
  PURCHASED_PATENT: 'purchased-patent',
  REFERRED_PROBLEM: 'referred problem',
  REFERRED_SOLUTION: 'referred solution',
  RELATED_PROBLEMS: 'relatedProblems',
  REWARD_HISTORY: 'RewardHistory',
  REWARDS_INITIATED: 'Reward distribution in progress....',
  REWARDS_TRANSFERED:
    'Rewards distibution completed. Check rewards in your wallet',
  RESET_PASSWORD_SUBJECT: 'Reset your password',
  RESET_PASSWORD_EMAIL_SENT: 'Check your email for reset link.',
  RESET_PASSWORD_SUCCESS: 'Password reset successful. Please Login.',
  RESET_TOKEN: 'resetToken',
  REWARDS_INITIATED: 'Reward distribution in progress....',
  REWARDS_TRANSFERED:
    'Rewards distibution completed. Check rewards in your wallet',
  SELECTED: 'selected',
  STREAM: 'stream',
  SHARE: 'share',
  SOLUTION_MONGOOSE_DAL: 'SolutionMongooseDal',
  SOLUTION: 'solution',
  SUCCESS: 'success',
  TAG_ASSOCIATED: 'tag-associated',
  TAG_CREATE: 'tagcreate',
  TAG_USER: 'tagUser',
  TAG: 'Tag',
  TAGS: 'tags',
  TOKEN_THRESHOLD: '21000000',
  TOTAL: 'total',
  TYPE: 'type',
  UNFOLLOW: 'unfollow',
  UNKNOWN: 'Unknown',
  UPDATE_MANY: 'updateMany',
  USER_ID: 'userId',
  USERNAME: 'username',
  USER_AGREEMENTS: 'userAgreements',
  WALLET_ADDRESS: 'walletAddress',
  ADMIN_ORDER: 'admin-order',
  C_ORDER: 'Order',
  C_BANNER: 'Banner', 
};

const CHANNELS = {
  ORDER_PLACE_CHANNEL: 'place-order-channel',
  ORDER_PLACE_ADMIN_CHANNEL: 'place-order-admin-channel',
};


const AI_EMAILS = {
  COMPLEXITY: 'complexity-profile@mm-test.com',
  DANGER: 'danger-profile@mm-test.com',
  FEATURE: 'feature-ability-profile@mm-test.com',
};

const MODALS = {
  PRODUCT: 'PRODUCT',
  AGREEMENT_TEMPLATE: 'AgreementTemplate',
  APPLICATION: 'Application',
  COMPANY_PRODUCT: 'CompanyProduct',
  CONTEST: 'Contest',
  PROBLEM: 'Problem',
  PROFILE: 'Profile',
  SOCIAL_AUTH_KEY: 'SocialAuthKey',
  SOLUTION: 'Solution',
  TAG: 'Tag',
  VOTE: 'Vote',
  AGREEMENT_TEMPLATE: 'AgreementTemplate',
};

const TYPES = {
  PROBLEMS: 'problems',
  SOLUTIONS: 'solutions',
  SOLUTION: 'solution',
  APPLICATION: 'application',
};

const SOCIAL_AUTH = {
  BITMOJI: 'bitmoji',
  DISCORD: 'discord',
  DISPLAY_NAME: 'displayName',
  EMAIL: 'email',
  FACEBOOK: 'facebook',
  GOOGLE: 'google',
  ID: 'id',
  IDENTIFY: 'identify',
  IDENTITY: 'identity',
  INSTAGRAM: 'instagram',
  LINK: 'link',
  LINKEDIN: 'linkedin',
  NAME: 'name',
  OPENID: 'openid',
  PHOTOS: 'photos',
  PROFILE: 'profile',
  PUBLIC_PROFILE: 'public_profile',
  READ: 'read',
  REDDIT: 'reddit',
  SCOPE_YOUTUBE: 'https://www.googleapis.com/auth/youtube.readonly',
  SNAPCHAT: 'snapchat',
  TIKTOK: 'tiktok',
  TWITTER: 'twitter',
  USER_BITMOJI_AVATAR: 'user.bitmoji.avatar',
  USER_DISPLAY_NAME: 'user.display_name',
  USER_EXTERNAL_ID: 'user.external_id',
  USER_PHOTOS: 'user_photos',
  USERS_READ: 'users.read',
  W_MEMBER_SOCIAL: 'w_member_social',
  YOUTUBE: 'youtube',
};

const ERRORS = {
  CREATE_WALLET: 'Failed to create a new wallet:',
  CONTEST_IDEAPOINTS:
    'An error occured while assigning ideapoints to contest winner',
  CORS_NOT_ALLOWED: 'Not allowed by CORS',
  CREATE_PROFILE: 'Create Profile Error',
  ERROR_FETCHING_SOLUTIONS: 'Error fetching solutions',
  ERROR_GETTING_TAGS: 'Error getting tag by user id:',
  ERROR_SELECTING_TAG: 'Selecting tag by user id error',
  FAILED_TO_CREATE_WALLET: 'Failed to create a new wallet',
  FINDING_CONTEST: 'An error occured while finding contest',
  FOLLOWING_TAG_ERROR: 'Following Tag Error',
  IMPROVE_APPLICATION:
    'An error occured while assigning improve application or purchased patent ideapoints.',
  INTERNAL_SERVER_ERROR: 'Internal Server Error.',
  INVALID_ADDRESS: 'Invalid Ethereum address provided.',
  INVALID_AMOUNT: 'Invalid amount provided. Please enter a positive number.',
  INVALID_PARAMETER: 'Invalid Parameters, Cannot be empty.',
  AMOUNT_EXCEEDED: 'Adjusted amount exceeds remaining supply.',
  MATIC_INSUFFICIENT: 'Owner Does not have enough MATIC.',
  IDEACOINS_INSUFFICIENT: 'User does not have IdeaCoins.',
  INVALID_PARAMETER: 'Invalid Parameters',
  INVITE_IDEAPOINTS:
    'An error occured while assigning ideapoints for iniviting user.',
  ISFILED_IDEAPOINTS: 'An error occured while isFiled for ideapoints.',
  ISPAID_IDEAPOINTS: 'An error occured while isPaid for ideapoints.',
  PROBLEM_IDEAPOINTS:
    'An error occured assigning ideapoints while creating problem.',
  PROFILE_IDEAPOINTS:
    'An error occured in assigning ideapoints in profile update.',
  ROOT_ITEM_NOT_FOUND: 'Root Item Not Found',
  SELECTING_USERTAGS: 'Selecting usertags error',
  SOLUTION_IDEAPOINTS: 'An error occured while assigning solution ideapoints.',
  SOLUTION_TAGS: 'An error occured while updating solution tags.',
  TAG_NOT_FOUND: 'Tag not found',
  TRACK_ACTIVITY: 'An error occured while tracking activity.',
  TRANSACTION_FAILED: 'Error during transaction: ',
  REWARD_TRANSFER_FAILED: 'Reward transfer failed for walletAddress:',
  ERROR_UPDATTING_CONTEST: 'Error Updating Contest',
  APPLICATION_NOT_FOUND: 'Application not found',
  INSERT_REWARD_ITERATION: 'An error occured while inserting reward iteration',
  GET_REWARD_ITERATION: 'An error occured while fetching reward iteration',
  GET_REWARD_THRESHOLD: 'Error fetching rewards pool threshold',
  GET_ELIGIBLE_USERS: 'Error fetching eligible users: ',
  MAIL_SENDING_ERROR: 'Error while sending mail',
  EMAILS_QUEUE_ADDING_ERROR: 'Error while adding emails in queue: ',
  MATIC_BALANCE_MONITORING_ERROR: 'Error monitoring MATIC balance: ',
  GET_AI_IMAGE_URL: 'Error getting image URL: ',
  GEN_AI_DESCR_AND_IMG: 'Error while genrating AI Description and Image',
  SIGN_UP: 'Sign Up Error',
  SIGN_IN: 'Sign In Error',
  GENERATE_TOKEN_ERROR: 'Generate Token Error: ',
  INCORRECT_EMAIL_OR_PASSWORD: 'Incorrect Email or Password.',
  TYPE_NOT_FOUND: 'Type not found',
  USER_NOT_EXIST: 'User does not exists',
  UNAUTHORIZED: 'Unauthorized',
  UNEXPECTED_ERROR: 'An unexpected error occurred',
  RESET_LINK_EXPIRED: 'The reset link has expired. Please generate a new one.',
  UPLOAD_IMAGE: 'Image upload error:'
};

const IDEAPOINTS = {
  CONCEPT_PROBLEM: 5,
  CONCEPT_SOLUTION_THREE: 10,
  CONCEPT_SOLUTION: 5,
  CONTEST: 1000,
  CREATED_PROBLEM: 1,
  CREATED_SOLUTION: 1,
  IMPROVE_PROBLEM: 5,
  IMPROVE_SOLUTION: 5,
  INVITED_USER: 250,
  OWNER_CREATED_SOLUTION: 5,
  PATENT_PENDING_SOLUTION: 100,
  PATENT_PENDING: 500,
  PURCHASED_PATENT_SOLUTION: 50,
  PURCHASED_PATENT: 500,
  REFERRED_PROBLEM: 5,
  REFERRED_SOLUTION: 5,
  SHARE: 25,
  TAG_ASSOCIATED: 1,
};

const APPLICATION_PATHS = {
  SELECTED: 'selected',
};

const EVENTS = {
  REWARD_DISTRIBUTED: 'IdeaRewardDistributed',
  IMAGE_FROM_DESCR: 'IMAGE_FROM_DESCR',
  LOADING: 'loading',
};

const SUCCESS_MESSAGES = {
  FOLLOWED_SUCCESSFULLY: 'Followed successfully',
  NFT_ADDED_TO_CONTEST_SUCCESSFULLY: 'NFT added to contest successfully',
  REWARDS_TRANSFERED_SUCCESSFULL:
    'Rewards transferred and credits updated successfully',
  UNFOLLOWED_SUCCESSFULLY: 'Unfollowed successfully',
  REWARDS_TRANSFERED_SUCCESSFULL:
    'Rewards transferred and credits updated successfully',
  UNFOLLOWED_SUCCESSFULLY: 'Unfollowed successfully',
  SIGN_UP: 'Sign Up successful',
  LOG_IN: 'Log In successful',
};

const LEVEL = {
  LEVEL_3: 3,
};

const DEFAULT_IMAGE = {
  MINDMINER:
    'https://media.licdn.com/dms/image/C4E0BAQG62DyBHcR9qQ/company-logo_200_200/0/1630640542689?e=2147483647&v=beta&t=R0xs8kooWxD43eifpNJZc_tsZdDsiy8QSuHX96ZLuoo',
};

const SUPPORT_EMAIL = 'jeff@mndmnr.com';

module.exports = {
  activityAction,
  activityItem,
  AI_EMAILS,
  APPLICATION_PATHS,
  CHANNELS,
  COMMON,
  DEFAULT_IMAGE,
  ERRORS,
  EVENTS,
  EXCLUSIVE_CANCEL_TIME,
  filters,
  FINALIZE_TYPE,
  IDEAPOINTS,
  LEVEL,
  MODALS,
  patentApplication,
  PAY_STATUS,
  PAYMENT_STATUS,
  POPULATE_FIELDS,
  rewardResource,
  rewardType,
  SIGN_STATUS,
  signDocType,
  SOCIAL_AUTH,
  STRIPE_EVENTS,
  SUPPORT_EMAIL,
  SUBSCRIPTION,
  SUCCESS_MESSAGES,
  TAG_TYPES,
  termsTemplateType,
  TYPES,
  voteType,
};
