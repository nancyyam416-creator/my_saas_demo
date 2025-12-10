import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { SimulationState, Alarm, BillingAccount } from "../types";

const API_KEY = process.env.API_KEY || ''; 

// Initialize the client only if key exists (handled gracefully in caller)
const getClient = () => {
  if (!API_KEY) return null;
  return new GoogleGenAI({ apiKey: API_KEY });
};

export const analyzeSystemState = async (
  simState: SimulationState, 
  alarms: Alarm[], 
  account: BillingAccount
): Promise<string> => {
  const client = getClient();
  if (!client) {
    return "AI 助手不可用: 未配置 API Key。请在环境变量中导出 API_KEY。";
  }

  const prompt = `
    作为宿舍管理系统的物联网系统分析师。
    分析以下数据快照，并提供简短（最多3句）的关于能源效率或安全方面的见解或建议。

    当前房间状态:
    - 人数: ${simState.roomOccupancy} 人
    - 温度: ${simState.roomTemperature}°C
    - 电源状态: ${simState.powerState ? '开启' : '关闭'}
    - 空调状态: ${simState.acState ? '开启' : '关闭'}
    
    计费状态:
    - 用户角色: ${account.role}
    - 余额: ¥${account.balance}
    - 今日用水: ${account.dailyWaterUsage}L
    
    活跃报警:
    ${alarms.map(a => `- [${a.severity}] ${a.title}`).join('\n')}

    回复格式: 纯文本 (请使用中文回答)。
  `;

  try {
    const response: GenerateContentResponse = await client.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text || "暂无分析结果。";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "连接 AI 分析服务时出错。";
  }
};