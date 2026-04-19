import { AuthRole } from "@/services/authService";

function parseRole(value: unknown): AuthRole | null {
  if (typeof value !== "string") return null;

  const normalized = value.trim().toLowerCase().replace(/^role[_:\-]?/, "");
  if (normalized === "admin") return "admin";
  if (normalized === "operation_manager" || normalized === "operationmanager" || normalized === "ops_manager" || normalized === "ops") {
    return "operation_manager";
  }
  if (normalized === "field_sales_executive" || normalized === "fieldsalesexecutive" || normalized === "field_sales" || normalized === "fse") {
    return "field_sales_executive";
  }

  return null;
}

function toRoleList(roleOrRoles: unknown) {
  if (!roleOrRoles) return [] as AuthRole[];

  const raw = Array.isArray(roleOrRoles) ? roleOrRoles : [roleOrRoles];
  const mapped = raw
    .map((item) => {
      if (item && typeof item === "object") {
        const record = item as Record<string, unknown>;
        return parseRole(record.role) || parseRole(record.name) || parseRole(record.authority);
      }
      return parseRole(item);
    })
    .filter((item): item is AuthRole => Boolean(item));

  return Array.from(new Set(mapped));
}

export function hasRole(roleOrRoles: unknown, expected: AuthRole) {
  return toRoleList(roleOrRoles).includes(expected);
}

export function hasAnyRole(roleOrRoles: unknown, allowedRoles: AuthRole[]) {
  const roles = toRoleList(roleOrRoles);
  return allowedRoles.some((allowed) => roles.includes(allowed));
}

export function isAdmin(roleOrRoles: unknown) {
  return hasRole(roleOrRoles, "admin");
}

export function isOperationManager(roleOrRoles: unknown) {
  return hasRole(roleOrRoles, "operation_manager");
}

export function isFieldSalesExecutive(roleOrRoles: unknown) {
  return hasRole(roleOrRoles, "field_sales_executive");
}
