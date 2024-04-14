(module
 (memory 1 1)
 (func (export "assume.const.memory") (param i32) (result i32)
       local.get 0)
 (func (export "assume.const.memory.transitive") (param i32) (result i32)
       local.get 0)
 (func (export "push.context") (param i32))
 (func (export "pop.context"))
 (func (export "update.context") (param i32))
 (func (export "read.reg") (param i64) (result i64)
       i64.const 0)
 (func (export "write.reg") (param i64 i64))
 (func (export "trace.line") (param i32))
 (func (export "abort.specialization") (param i32 i32))
 (func (export "assert.const32") (param i32 i32))
 (func (export "assert.const.memory") (param i32 i32))
 (func (export "specialize.value") (param i32 i32 i32) (result i32)
 local.get 0)
 (func (export "print") (param i32 i32 i32))
 (func (export "read.global") (param i64) (result i64)
       local.get 0
       i32.wrap_i64
       i32.const 3
       i32.shl
       i64.load)
 (func (export "write.global") (param i64 i64)
       local.get 0
       i32.wrap_i64
       i32.const 3
       i32.shl
       local.get 1
       i64.store))
