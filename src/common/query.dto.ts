export class QueryDto {
  /**
   * 分页大小
   */
  _limit?: number;

  /**
   * 分页偏移
   */
  _offset?: number;

  /**
   * 排序字段
   */
  _sort?: string;
}
