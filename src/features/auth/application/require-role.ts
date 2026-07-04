import type { Actor, AppRole } from "@/features/auth/application/current-actor";
import { getCurrentActor } from "@/features/auth/application/current-actor";

type ActorResolver = () => Promise<Actor | null>;

export class UnauthenticatedError extends Error {
  constructor() {
    super("Authentication is required");
    this.name = "UnauthenticatedError";
  }
}

export class ForbiddenError extends Error {
  constructor() {
    super("The current actor does not have the required role");
    this.name = "ForbiddenError";
  }
}

export function createRequireRole(resolveActor: ActorResolver) {
  return async function requireRole(role: AppRole): Promise<Actor> {
    const actor = await resolveActor();
    if (!actor) throw new UnauthenticatedError();
    if (actor.role !== role) throw new ForbiddenError();
    return actor;
  };
}

export const requireRole = createRequireRole(getCurrentActor);
