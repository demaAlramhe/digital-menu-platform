import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";

type LogAdminActionParams = {
  actorId: string;
  actorEmail: string | null | undefined;
  action: string;
  targetType: string;
  targetId?: string | null;
  metadata?: Record<string, unknown>;
};

export async function logAdminAction(
  supabase: SupabaseClient,
  params: LogAdminActionParams
): Promise<void> {
  try {
    const { error } = await supabase.from("audit_log").insert({
      actor_id: params.actorId,
      actor_email: params.actorEmail ?? null,
      action: params.action,
      target_type: params.targetType,
      target_id: params.targetId ?? null,
      metadata: params.metadata ?? {},
    });
    if (error) {
      console.error("[audit-log] failed to write audit row", {
        action: params.action,
        targetType: params.targetType,
        targetId: params.targetId,
        error,
      });
    }
  } catch (err) {
    console.error("[audit-log] unexpected error writing audit row", err);
  }
}
