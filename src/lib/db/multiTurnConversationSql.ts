/**
 * The conversation list's total: conversations that hold at least two turn nodes. It is a
 * leaf module (no imports) so the off-thread counter in conversationCountWorker.ts can load
 * it natively without pulling the DB singleton into the worker.
 *
 * The correlated COUNT(*) walks every conversation's turn nodes, so its cost grows with the
 * whole conversation_turn_nodes table rather than with the page size.
 */
export const MULTI_TURN_CONVERSATION_COUNT_SQL = `SELECT COUNT(*) as c FROM agentic_conversations ac
         WHERE (SELECT COUNT(*) FROM conversation_turn_nodes n WHERE n.conversation_id = ac.id) >= 2`;
