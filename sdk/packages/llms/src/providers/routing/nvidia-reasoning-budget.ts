import type {
	GatewayProviderMetadata,
	GatewayStreamRequest,
} from "@cline/shared";
import { buildProviderAndAliasPatch, type ProviderOptionsPatch } from "./utils";

/**
 * NVIDIA NIM caps reasoning with a top-level `reasoning_budget` field rather
 * than an effort level: its reasoning models treat every effort from low to
 * max alike, so a budget is the only way to bound how long they think.
 */
export const NVIDIA_REASONING_ROUTING_METADATA: GatewayProviderMetadata = {
	routing: {
		reasoning: {
			format: "nvidia-reasoning-budget",
			routes: [{ matcher: "model-operation", operation: "language" }],
		},
	},
};

export function buildNvidiaReasoningBudgetProviderOptionsPatch(
	request: GatewayStreamRequest,
	providerOptionsKey: string,
): ProviderOptionsPatch | undefined {
	const budgetTokens = request.reasoning?.budgetTokens;
	if (
		request.reasoning?.enabled === false ||
		typeof budgetTokens !== "number"
	) {
		return undefined;
	}
	// `@ai-sdk/openai-compatible` spreads unknown provider options into the
	// request body, so this reaches the endpoint as a top-level field.
	return buildProviderAndAliasPatch({
		providerId: request.providerId,
		providerOptionsKey,
		bucketOptions: { reasoning_budget: budgetTokens },
	});
}
