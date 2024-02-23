import { OmitType, PartialType } from '@nestjs/swagger';

import { CreateNamespaceDto } from './create-namespace.dto';

/**
 * Update namespace
 *
 * 不允许修改 namespace 的 ns, parentId 字段
 * 如果想修改 ns，只能建立一个新的 namespace
 */

export class UpdateNamespaceDto extends PartialType(
  OmitType(CreateNamespaceDto, ['ns', 'parent'])
) {}
