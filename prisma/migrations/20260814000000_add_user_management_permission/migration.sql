UPDATE public."User"
SET permissions = array_append(permissions, 'user-management/*')
WHERE '*/*' = ANY(permissions)
  AND NOT ('user-management/*' = ANY(permissions));
