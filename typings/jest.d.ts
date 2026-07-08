// @types/jest@29.5.x 的 Describe 类型未收录 describe.skipIf（jest 29.5+ 运行时已支持），
// 在此通过命名空间合并补齐类型，供 spec 文件使用。
declare namespace jest {
  interface Describe {
    /** 当 condition 为 true 时跳过该 describe 块内的测试 */
    skipIf: (condition: boolean) => Describe;
  }
}
