import type { Language, Order, WorkflowMode } from './types';

type TranslationMap = Record<string, string>;

export const DEFAULT_WORKFLOW_MODE: WorkflowMode = 'service_only';

export const getEnvWorkflowMode = (): WorkflowMode | null => {
  const rawMode = import.meta.env.VITE_WORKFLOW_MODE;

  if (typeof rawMode !== 'string') {
    return null;
  }

  const normalizedMode = rawMode.trim().toLowerCase();
  if (normalizedMode === 'kitchen') {
    return 'kitchen';
  }

  if (normalizedMode === 'service_only') {
    return 'service_only';
  }

  return null;
};

const WORKFLOW_TRANSLATIONS: Record<Language, Record<WorkflowMode, Partial<TranslationMap>>> = {
  en: {
    service_only: {
      yourFoodPrepared: 'Your order has been received and will be served shortly.',
      preparing: 'Ready',
      acceptOrder: '🍽️ Serve Now',
      kitchenTab: '📋 Orders',
      kitchenDisplay: 'Order Board',
      pendingOnly: 'New',
      cookingOnly: 'Ready',
      noKitchenOrders: 'No open orders 🎉',
      roleKitchen: 'Order Desk',
      kitchenViewEyebrow: 'Service',
      kitchenViewTitle: 'Orders',
      kitchenViewDescription: 'Track incoming orders and mark them served once they are handed over.',
      workflowBoardIntro: 'New orders can be handed over immediately. Legacy ready orders stay visible until they are served.',
      staffAccessHint: 'Use a staff account for orders, cashier, and admin tools.',
      workflowMode: 'Workflow Mode',
      workflowModeDescription: 'Choose how your team handles orders.',
      serviceWorkflow: 'Service-Only Workflow',
      serviceWorkflowHint: 'New orders can move straight to served without a kitchen acceptance step.',
      kitchenWorkflow: 'Kitchen Workflow',
      kitchenWorkflowHint: 'Orders must be accepted before they can be marked served.',
      workflowSaved: 'Workflow mode updated.',
      workflowSaveFailed: 'Failed to update workflow mode.',
      workflowEnvLocked: 'Workflow mode is managed from your .env file.',
      workflowEnvHint: 'Set VITE_WORKFLOW_MODE in .env to control this deployment.'
    },
    kitchen: {
      yourFoodPrepared: 'Your order is being prepared 👨‍🍳',
      preparing: 'Preparing',
      acceptOrder: '✅ Accept Order',
      kitchenTab: '👨‍🍳 Kitchen',
      kitchenDisplay: 'Kitchen Board',
      pendingOnly: 'Pending',
      cookingOnly: 'Preparing',
      noKitchenOrders: 'No kitchen orders 🎉',
      roleKitchen: 'Kitchen',
      kitchenViewEyebrow: 'Kitchen',
      kitchenViewTitle: 'Kitchen',
      kitchenViewDescription: 'Review new orders, accept them, and mark them served when they are ready.',
      workflowBoardIntro: 'Accept new orders, keep preparing items visible, and mark them served when they go out.',
      staffAccessHint: 'Use a staff account for kitchen, cashier, and admin tools.',
      workflowMode: 'Workflow Mode',
      workflowModeDescription: 'Choose how your team handles orders.',
      serviceWorkflow: 'Service-Only Workflow',
      serviceWorkflowHint: 'New orders can move straight to served without a kitchen acceptance step.',
      kitchenWorkflow: 'Kitchen Workflow',
      kitchenWorkflowHint: 'Orders must be accepted before they can be marked served.',
      workflowSaved: 'Workflow mode updated.',
      workflowSaveFailed: 'Failed to update workflow mode.',
      workflowEnvLocked: 'Workflow mode is managed from your .env file.',
      workflowEnvHint: 'Set VITE_WORKFLOW_MODE in .env to control this deployment.'
    }
  },
  my: {
    service_only: {
      yourFoodPrepared: 'အော်ဒါ လက်ခံရရှိပြီး မကြာမီ ဆောင်ပေးပါမည်။',
      preparing: 'အသင့်',
      acceptOrder: '🍽️ ဆောင်မည်',
      kitchenTab: '📋 အော်ဒါ',
      kitchenDisplay: 'အော်ဒါဘုတ်',
      pendingOnly: 'အသစ်',
      cookingOnly: 'အသင့်',
      noKitchenOrders: 'ဖွင့်ထားသော အော်ဒါမရှိပါ 🎉',
      roleKitchen: 'အော်ဒါကောင်တာ',
      kitchenViewEyebrow: 'ဝန်ဆောင်မှု',
      kitchenViewTitle: 'အော်ဒါ',
      kitchenViewDescription: 'ဝင်လာသော အော်ဒါများကို ကြည့်ပြီး ဆောင်ပြီးသည်နှင့် အမှတ်အသားပြုနိုင်ပါသည်။',
      workflowBoardIntro: 'အော်ဒါအသစ်များကို တိုက်ရိုက်ဆောင်နိုင်ပြီး အဆင်သင့်အော်ဒါများကို ဆောင်ပြီးသည်အထိ မြင်နိုင်ပါသည်။',
      staffAccessHint: 'အော်ဒါ၊ ငွေရှင်းနှင့် စီမံခန့်ခွဲမှုအတွက် ဝန်ထမ်းအကောင့်ဖြင့် ဝင်ရောက်ပါ။',
      workflowMode: 'လုပ်ငန်းစဉ်ပုံစံ',
      workflowModeDescription: 'အော်ဒါကို အဖွဲ့က ဘယ်လိုကိုင်တွယ်မလဲ ရွေးပါ။',
      serviceWorkflow: 'တိုက်ရိုက်ဆောင်ပေးမည့် ပုံစံ',
      serviceWorkflowHint: 'အော်ဒါအသစ်များကို မီးဖိုလက်ခံမှုမလိုဘဲ တိုက်ရိုက် ဆောင်ပြီးအဖြစ် ပြောင်းနိုင်ပါသည်။',
      kitchenWorkflow: 'မီးဖိုလုပ်ငန်းစဉ်',
      kitchenWorkflowHint: 'အော်ဒါများကို ဆောင်ပြီးအဖြစ် မပြောင်းခင် အရင်လက်ခံရပါမည်။',
      workflowSaved: 'လုပ်ငန်းစဉ်ပုံစံကို အပ်ဒိတ်လုပ်ပြီးပါပြီ။',
      workflowSaveFailed: 'လုပ်ငန်းစဉ်ပုံစံကို အပ်ဒိတ်လုပ်မရပါ။',
      workflowEnvLocked: 'လုပ်ငန်းစဉ်ပုံစံကို .env မှ စီမံထားပါသည်။',
      workflowEnvHint: '.env ထဲရှိ VITE_WORKFLOW_MODE ကို သတ်မှတ်ပြီး ဤ deployment ကို ထိန်းချုပ်ပါ။'
    },
    kitchen: {
      yourFoodPrepared: 'သင့်အော်ဒါကို ပြင်ဆင်နေပါသည် 👨‍🍳',
      preparing: 'ပြင်ဆင်နေသည်',
      acceptOrder: '✅ လက်ခံမည်',
      kitchenTab: '👨‍🍳 မီးဖို',
      kitchenDisplay: 'မီးဖိုဘုတ်',
      pendingOnly: 'စောင့်နေသည်',
      cookingOnly: 'ပြင်ဆင်နေသည်',
      noKitchenOrders: 'မီးဖိုအော်ဒါ မရှိပါ 🎉',
      roleKitchen: 'မီးဖို',
      kitchenViewEyebrow: 'မီးဖို',
      kitchenViewTitle: 'မီးဖို',
      kitchenViewDescription: 'အော်ဒါအသစ်များကို လက်ခံပြီး ပြင်ဆင်ပြီးသည့်အခါ ဆောင်ပြီးအဖြစ် မှတ်သားနိုင်ပါသည်။',
      workflowBoardIntro: 'အော်ဒါအသစ်များကို လက်ခံပြီး ပြင်ဆင်နေသော အော်ဒါများကို မြင်နေစေကာ ထွက်သွားသည့်အခါ ဆောင်ပြီးအဖြစ် မှတ်သားပါ။',
      staffAccessHint: 'မီးဖို၊ ငွေရှင်းနှင့် စီမံခန့်ခွဲမှုအတွက် ဝန်ထမ်းအကောင့်ဖြင့် ဝင်ရောက်ပါ။',
      workflowMode: 'လုပ်ငန်းစဉ်ပုံစံ',
      workflowModeDescription: 'အော်ဒါကို အဖွဲ့က ဘယ်လိုကိုင်တွယ်မလဲ ရွေးပါ။',
      serviceWorkflow: 'တိုက်ရိုက်ဆောင်ပေးမည့် ပုံစံ',
      serviceWorkflowHint: 'အော်ဒါအသစ်များကို မီးဖိုလက်ခံမှုမလိုဘဲ တိုက်ရိုက် ဆောင်ပြီးအဖြစ် ပြောင်းနိုင်ပါသည်။',
      kitchenWorkflow: 'မီးဖိုလုပ်ငန်းစဉ်',
      kitchenWorkflowHint: 'အော်ဒါများကို ဆောင်ပြီးအဖြစ် မပြောင်းခင် အရင်လက်ခံရပါမည်။',
      workflowSaved: 'လုပ်ငန်းစဉ်ပုံစံကို အပ်ဒိတ်လုပ်ပြီးပါပြီ။',
      workflowSaveFailed: 'လုပ်ငန်းစဉ်ပုံစံကို အပ်ဒိတ်လုပ်မရပါ။',
      workflowEnvLocked: 'လုပ်ငန်းစဉ်ပုံစံကို .env မှ စီမံထားပါသည်။',
      workflowEnvHint: '.env ထဲရှိ VITE_WORKFLOW_MODE ကို သတ်မှတ်ပြီး ဤ deployment ကို ထိန်းချုပ်ပါ။'
    }
  }
};

export const applyWorkflowTranslations = (
  translations: TranslationMap,
  language: Language,
  workflowMode: WorkflowMode
) : TranslationMap => ({
  ...translations,
  ...WORKFLOW_TRANSLATIONS[language][workflowMode]
}) as TranslationMap;

export const getNextWorkflowStatus = (
  workflowMode: WorkflowMode,
  status: Order['status']
): Order['status'] | null => {
  if (status === 'pending') {
    return workflowMode === 'kitchen' ? 'accepted' : 'served';
  }

  if (status === 'accepted') {
    return 'served';
  }

  return null;
};
