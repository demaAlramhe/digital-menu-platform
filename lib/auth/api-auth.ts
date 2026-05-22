import { NextResponse } from "next/server";
import { getCurrentProfile } from "@/lib/auth/get-current-profile";

export type ApiProfile = {
  id: string;
  full_name: string | null;
  role: string;
  store_id: string | null;
};

export type ApiAuthContext = {
  user: { id: string; email?: string };
  profile: ApiProfile;
};

type AuthSuccess = {
  auth: ApiAuthContext;
  errorResponse: null;
};

type AuthFailure = {
  auth: null;
  errorResponse: NextResponse;
};

export async function requireApiUser(): Promise<AuthSuccess | AuthFailure> {
  const current = await getCurrentProfile();

  if (!current?.user) {
    return {
      auth: null,
      errorResponse: NextResponse.json({ error: "Unauthorized." }, { status: 401 }),
    };
  }

  if (!current.profile) {
    return {
      auth: null,
      errorResponse: NextResponse.json(
        { error: "Profile not found." },
        { status: 403 }
      ),
    };
  }

  return {
    auth: {
      user: { id: current.user.id, email: current.user.email },
      profile: current.profile as ApiProfile,
    },
    errorResponse: null,
  };
}

export async function requireApiSuperAdmin(): Promise<AuthSuccess | AuthFailure> {
  const result = await requireApiUser();
  if (result.errorResponse) {
    return result;
  }

  if (result.auth.profile.role !== "super_admin") {
    return {
      auth: null,
      errorResponse: NextResponse.json({ error: "Forbidden." }, { status: 403 }),
    };
  }

  return result;
}

export type StoreOwnerAuthSuccess = AuthSuccess & { storeId: string };

export async function requireApiStoreOwner(): Promise<
  StoreOwnerAuthSuccess | AuthFailure
> {
  const result = await requireApiUser();
  if (result.errorResponse) {
    return result;
  }

  const { profile } = result.auth;

  if (profile.role !== "store_owner") {
    return {
      auth: null,
      errorResponse: NextResponse.json({ error: "Forbidden." }, { status: 403 }),
    };
  }

  if (!profile.store_id) {
    return {
      auth: null,
      errorResponse: NextResponse.json(
        { error: "No store is linked to this account." },
        { status: 403 }
      ),
    };
  }

  return {
    auth: result.auth,
    storeId: profile.store_id,
    errorResponse: null,
  };
}

export async function requireApiStoreOwnerOrSuperAdmin(): Promise<
  AuthSuccess | AuthFailure
> {
  const result = await requireApiUser();
  if (result.errorResponse) {
    return result;
  }

  const role = result.auth.profile.role;

  if (role !== "store_owner" && role !== "super_admin") {
    return {
      auth: null,
      errorResponse: NextResponse.json({ error: "Forbidden." }, { status: 403 }),
    };
  }

  if (role === "store_owner" && !result.auth.profile.store_id) {
    return {
      auth: null,
      errorResponse: NextResponse.json(
        { error: "No store is linked to this account." },
        { status: 403 }
      ),
    };
  }

  return result;
}
