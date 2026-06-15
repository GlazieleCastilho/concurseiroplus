
/**
 * Client
**/

import * as runtime from './runtime/client.js';
import $Types = runtime.Types // general types
import $Public = runtime.Types.Public
import $Utils = runtime.Types.Utils
import $Extensions = runtime.Types.Extensions
import $Result = runtime.Types.Result

export type PrismaPromise<T> = $Public.PrismaPromise<T>


/**
 * Model User
 * 
 */
export type User = $Result.DefaultSelection<Prisma.$UserPayload>
/**
 * Model CourseTag
 * 
 */
export type CourseTag = $Result.DefaultSelection<Prisma.$CourseTagPayload>
/**
 * Model Course
 * 
 */
export type Course = $Result.DefaultSelection<Prisma.$CoursePayload>
/**
 * Model CourseModule
 * 
 */
export type CourseModule = $Result.DefaultSelection<Prisma.$CourseModulePayload>
/**
 * Model CourseLesson
 * 
 */
export type CourseLesson = $Result.DefaultSelection<Prisma.$CourseLessonPayload>

/**
 * Enums
 */
export namespace $Enums {
  export const CourseStatus: {
  DRAFT: 'DRAFT',
  PUBLISHED: 'PUBLISHED'
};

export type CourseStatus = (typeof CourseStatus)[keyof typeof CourseStatus]


export const CourseDifficulty: {
  EASY: 'EASY',
  MEDIUM: 'MEDIUM',
  HARD: 'HARD'
};

export type CourseDifficulty = (typeof CourseDifficulty)[keyof typeof CourseDifficulty]

}

export type CourseStatus = $Enums.CourseStatus

export const CourseStatus: typeof $Enums.CourseStatus

export type CourseDifficulty = $Enums.CourseDifficulty

export const CourseDifficulty: typeof $Enums.CourseDifficulty

/**
 * ##  Prisma Client ʲˢ
 *
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient({
 *   adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL })
 * })
 * // Fetch zero or more Users
 * const users = await prisma.user.findMany()
 * ```
 *
 *
 * Read more in our [docs](https://pris.ly/d/client).
 */
export class PrismaClient<
  ClientOptions extends Prisma.PrismaClientOptions = Prisma.PrismaClientOptions,
  const U = 'log' extends keyof ClientOptions ? ClientOptions['log'] extends Array<Prisma.LogLevel | Prisma.LogDefinition> ? Prisma.GetEvents<ClientOptions['log']> : never : never,
  ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
> {
  [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['other'] }

    /**
   * ##  Prisma Client ʲˢ
   *
   * Type-safe database client for TypeScript & Node.js
   * @example
   * ```
   * const prisma = new PrismaClient({
   *   adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL })
   * })
   * // Fetch zero or more Users
   * const users = await prisma.user.findMany()
   * ```
   *
   *
   * Read more in our [docs](https://pris.ly/d/client).
   */

  constructor(optionsArg ?: Prisma.Subset<ClientOptions, Prisma.PrismaClientOptions>);
  $on<V extends U>(eventType: V, callback: (event: V extends 'query' ? Prisma.QueryEvent : Prisma.LogEvent) => void): PrismaClient;

  /**
   * Connect with the database
   */
  $connect(): $Utils.JsPromise<void>;

  /**
   * Disconnect from the database
   */
  $disconnect(): $Utils.JsPromise<void>;

/**
   * Executes a prepared raw query and returns the number of affected rows.
   * @example
   * ```
   * const result = await prisma.$executeRaw`UPDATE User SET cool = ${true} WHERE email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://pris.ly/d/raw-queries).
   */
  $executeRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Executes a raw query and returns the number of affected rows.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$executeRawUnsafe('UPDATE User SET cool = $1 WHERE email = $2 ;', true, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://pris.ly/d/raw-queries).
   */
  $executeRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Performs a prepared raw query and returns the `SELECT` data.
   * @example
   * ```
   * const result = await prisma.$queryRaw`SELECT * FROM User WHERE id = ${1} OR email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://pris.ly/d/raw-queries).
   */
  $queryRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<T>;

  /**
   * Performs a raw query and returns the `SELECT` data.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$queryRawUnsafe('SELECT * FROM User WHERE id = $1 OR email = $2;', 1, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://pris.ly/d/raw-queries).
   */
  $queryRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<T>;


  /**
   * Allows the running of a sequence of read/write operations that are guaranteed to either succeed or fail as a whole.
   * @example
   * ```
   * const [george, bob, alice] = await prisma.$transaction([
   *   prisma.user.create({ data: { name: 'George' } }),
   *   prisma.user.create({ data: { name: 'Bob' } }),
   *   prisma.user.create({ data: { name: 'Alice' } }),
   * ])
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/orm/prisma-client/queries/transactions).
   */
  $transaction<P extends Prisma.PrismaPromise<any>[]>(arg: [...P], options?: { isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<runtime.Types.Utils.UnwrapTuple<P>>

  $transaction<R>(fn: (prisma: Omit<PrismaClient, runtime.ITXClientDenyList>) => $Utils.JsPromise<R>, options?: { maxWait?: number, timeout?: number, isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<R>

  $extends: $Extensions.ExtendsHook<"extends", Prisma.TypeMapCb<ClientOptions>, ExtArgs, $Utils.Call<Prisma.TypeMapCb<ClientOptions>, {
    extArgs: ExtArgs
  }>>

      /**
   * `prisma.user`: Exposes CRUD operations for the **User** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Users
    * const users = await prisma.user.findMany()
    * ```
    */
  get user(): Prisma.UserDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.courseTag`: Exposes CRUD operations for the **CourseTag** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more CourseTags
    * const courseTags = await prisma.courseTag.findMany()
    * ```
    */
  get courseTag(): Prisma.CourseTagDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.course`: Exposes CRUD operations for the **Course** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Courses
    * const courses = await prisma.course.findMany()
    * ```
    */
  get course(): Prisma.CourseDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.courseModule`: Exposes CRUD operations for the **CourseModule** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more CourseModules
    * const courseModules = await prisma.courseModule.findMany()
    * ```
    */
  get courseModule(): Prisma.CourseModuleDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.courseLesson`: Exposes CRUD operations for the **CourseLesson** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more CourseLessons
    * const courseLessons = await prisma.courseLesson.findMany()
    * ```
    */
  get courseLesson(): Prisma.CourseLessonDelegate<ExtArgs, ClientOptions>;
}

export namespace Prisma {
  export import DMMF = runtime.DMMF

  export type PrismaPromise<T> = $Public.PrismaPromise<T>

  /**
   * Validator
   */
  export import validator = runtime.Public.validator

  /**
   * Prisma Errors
   */
  export import PrismaClientKnownRequestError = runtime.PrismaClientKnownRequestError
  export import PrismaClientUnknownRequestError = runtime.PrismaClientUnknownRequestError
  export import PrismaClientRustPanicError = runtime.PrismaClientRustPanicError
  export import PrismaClientInitializationError = runtime.PrismaClientInitializationError
  export import PrismaClientValidationError = runtime.PrismaClientValidationError

  /**
   * Re-export of sql-template-tag
   */
  export import sql = runtime.sqltag
  export import empty = runtime.empty
  export import join = runtime.join
  export import raw = runtime.raw
  export import Sql = runtime.Sql



  /**
   * Decimal.js
   */
  export import Decimal = runtime.Decimal

  export type DecimalJsLike = runtime.DecimalJsLike

  /**
  * Extensions
  */
  export import Extension = $Extensions.UserArgs
  export import getExtensionContext = runtime.Extensions.getExtensionContext
  export import Args = $Public.Args
  export import Payload = $Public.Payload
  export import Result = $Public.Result
  export import Exact = $Public.Exact

  /**
   * Prisma Client JS version: 7.7.0
   * Query Engine version: 75cbdc1eb7150937890ad5465d861175c6624711
   */
  export type PrismaVersion = {
    client: string
    engine: string
  }

  export const prismaVersion: PrismaVersion

  /**
   * Utility Types
   */


  export import Bytes = runtime.Bytes
  export import JsonObject = runtime.JsonObject
  export import JsonArray = runtime.JsonArray
  export import JsonValue = runtime.JsonValue
  export import InputJsonObject = runtime.InputJsonObject
  export import InputJsonArray = runtime.InputJsonArray
  export import InputJsonValue = runtime.InputJsonValue

  /**
   * Types of the values used to represent different kinds of `null` values when working with JSON fields.
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  namespace NullTypes {
    /**
    * Type of `Prisma.DbNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.DbNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class DbNull {
      private DbNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.JsonNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.JsonNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class JsonNull {
      private JsonNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.AnyNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.AnyNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class AnyNull {
      private AnyNull: never
      private constructor()
    }
  }

  /**
   * Helper for filtering JSON entries that have `null` on the database (empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const DbNull: NullTypes.DbNull

  /**
   * Helper for filtering JSON entries that have JSON `null` values (not empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const JsonNull: NullTypes.JsonNull

  /**
   * Helper for filtering JSON entries that are `Prisma.DbNull` or `Prisma.JsonNull`
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const AnyNull: NullTypes.AnyNull

  type SelectAndInclude = {
    select: any
    include: any
  }

  type SelectAndOmit = {
    select: any
    omit: any
  }

  /**
   * Get the type of the value, that the Promise holds.
   */
  export type PromiseType<T extends PromiseLike<any>> = T extends PromiseLike<infer U> ? U : T;

  /**
   * Get the return type of a function which returns a Promise.
   */
  export type PromiseReturnType<T extends (...args: any) => $Utils.JsPromise<any>> = PromiseType<ReturnType<T>>

  /**
   * From T, pick a set of properties whose keys are in the union K
   */
  type Prisma__Pick<T, K extends keyof T> = {
      [P in K]: T[P];
  };


  export type Enumerable<T> = T | Array<T>;

  export type RequiredKeys<T> = {
    [K in keyof T]-?: {} extends Prisma__Pick<T, K> ? never : K
  }[keyof T]

  export type TruthyKeys<T> = keyof {
    [K in keyof T as T[K] extends false | undefined | null ? never : K]: K
  }

  export type TrueKeys<T> = TruthyKeys<Prisma__Pick<T, RequiredKeys<T>>>

  /**
   * Subset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection
   */
  export type Subset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
  };

  /**
   * SelectSubset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection.
   * Additionally, it validates, if both select and include are present. If the case, it errors.
   */
  export type SelectSubset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    (T extends SelectAndInclude
      ? 'Please either choose `select` or `include`.'
      : T extends SelectAndOmit
        ? 'Please either choose `select` or `omit`.'
        : {})

  /**
   * Subset + Intersection
   * @desc From `T` pick properties that exist in `U` and intersect `K`
   */
  export type SubsetIntersection<T, U, K> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    K

  type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };

  /**
   * XOR is needed to have a real mutually exclusive union type
   * https://stackoverflow.com/questions/42123407/does-typescript-support-mutually-exclusive-types
   */
  type XOR<T, U> =
    T extends object ?
    U extends object ?
      (Without<T, U> & U) | (Without<U, T> & T)
    : U : T


  /**
   * Is T a Record?
   */
  type IsObject<T extends any> = T extends Array<any>
  ? False
  : T extends Date
  ? False
  : T extends Uint8Array
  ? False
  : T extends BigInt
  ? False
  : T extends object
  ? True
  : False


  /**
   * If it's T[], return T
   */
  export type UnEnumerate<T extends unknown> = T extends Array<infer U> ? U : T

  /**
   * From ts-toolbelt
   */

  type __Either<O extends object, K extends Key> = Omit<O, K> &
    {
      // Merge all but K
      [P in K]: Prisma__Pick<O, P & keyof O> // With K possibilities
    }[K]

  type EitherStrict<O extends object, K extends Key> = Strict<__Either<O, K>>

  type EitherLoose<O extends object, K extends Key> = ComputeRaw<__Either<O, K>>

  type _Either<
    O extends object,
    K extends Key,
    strict extends Boolean
  > = {
    1: EitherStrict<O, K>
    0: EitherLoose<O, K>
  }[strict]

  type Either<
    O extends object,
    K extends Key,
    strict extends Boolean = 1
  > = O extends unknown ? _Either<O, K, strict> : never

  export type Union = any

  type PatchUndefined<O extends object, O1 extends object> = {
    [K in keyof O]: O[K] extends undefined ? At<O1, K> : O[K]
  } & {}

  /** Helper Types for "Merge" **/
  export type IntersectOf<U extends Union> = (
    U extends unknown ? (k: U) => void : never
  ) extends (k: infer I) => void
    ? I
    : never

  export type Overwrite<O extends object, O1 extends object> = {
      [K in keyof O]: K extends keyof O1 ? O1[K] : O[K];
  } & {};

  type _Merge<U extends object> = IntersectOf<Overwrite<U, {
      [K in keyof U]-?: At<U, K>;
  }>>;

  type Key = string | number | symbol;
  type AtBasic<O extends object, K extends Key> = K extends keyof O ? O[K] : never;
  type AtStrict<O extends object, K extends Key> = O[K & keyof O];
  type AtLoose<O extends object, K extends Key> = O extends unknown ? AtStrict<O, K> : never;
  export type At<O extends object, K extends Key, strict extends Boolean = 1> = {
      1: AtStrict<O, K>;
      0: AtLoose<O, K>;
  }[strict];

  export type ComputeRaw<A extends any> = A extends Function ? A : {
    [K in keyof A]: A[K];
  } & {};

  export type OptionalFlat<O> = {
    [K in keyof O]?: O[K];
  } & {};

  type _Record<K extends keyof any, T> = {
    [P in K]: T;
  };

  // cause typescript not to expand types and preserve names
  type NoExpand<T> = T extends unknown ? T : never;

  // this type assumes the passed object is entirely optional
  type AtLeast<O extends object, K extends string> = NoExpand<
    O extends unknown
    ? | (K extends keyof O ? { [P in K]: O[P] } & O : O)
      | {[P in keyof O as P extends K ? P : never]-?: O[P]} & O
    : never>;

  type _Strict<U, _U = U> = U extends unknown ? U & OptionalFlat<_Record<Exclude<Keys<_U>, keyof U>, never>> : never;

  export type Strict<U extends object> = ComputeRaw<_Strict<U>>;
  /** End Helper Types for "Merge" **/

  export type Merge<U extends object> = ComputeRaw<_Merge<Strict<U>>>;

  /**
  A [[Boolean]]
  */
  export type Boolean = True | False

  // /**
  // 1
  // */
  export type True = 1

  /**
  0
  */
  export type False = 0

  export type Not<B extends Boolean> = {
    0: 1
    1: 0
  }[B]

  export type Extends<A1 extends any, A2 extends any> = [A1] extends [never]
    ? 0 // anything `never` is false
    : A1 extends A2
    ? 1
    : 0

  export type Has<U extends Union, U1 extends Union> = Not<
    Extends<Exclude<U1, U>, U1>
  >

  export type Or<B1 extends Boolean, B2 extends Boolean> = {
    0: {
      0: 0
      1: 1
    }
    1: {
      0: 1
      1: 1
    }
  }[B1][B2]

  export type Keys<U extends Union> = U extends unknown ? keyof U : never

  type Cast<A, B> = A extends B ? A : B;

  export const type: unique symbol;



  /**
   * Used by group by
   */

  export type GetScalarType<T, O> = O extends object ? {
    [P in keyof T]: P extends keyof O
      ? O[P]
      : never
  } : never

  type FieldPaths<
    T,
    U = Omit<T, '_avg' | '_sum' | '_count' | '_min' | '_max'>
  > = IsObject<T> extends True ? U : T

  type GetHavingFields<T> = {
    [K in keyof T]: Or<
      Or<Extends<'OR', K>, Extends<'AND', K>>,
      Extends<'NOT', K>
    > extends True
      ? // infer is only needed to not hit TS limit
        // based on the brilliant idea of Pierre-Antoine Mills
        // https://github.com/microsoft/TypeScript/issues/30188#issuecomment-478938437
        T[K] extends infer TK
        ? GetHavingFields<UnEnumerate<TK> extends object ? Merge<UnEnumerate<TK>> : never>
        : never
      : {} extends FieldPaths<T[K]>
      ? never
      : K
  }[keyof T]

  /**
   * Convert tuple to union
   */
  type _TupleToUnion<T> = T extends (infer E)[] ? E : never
  type TupleToUnion<K extends readonly any[]> = _TupleToUnion<K>
  type MaybeTupleToUnion<T> = T extends any[] ? TupleToUnion<T> : T

  /**
   * Like `Pick`, but additionally can also accept an array of keys
   */
  type PickEnumerable<T, K extends Enumerable<keyof T> | keyof T> = Prisma__Pick<T, MaybeTupleToUnion<K>>

  /**
   * Exclude all keys with underscores
   */
  type ExcludeUnderscoreKeys<T extends string> = T extends `_${string}` ? never : T


  export type FieldRef<Model, FieldType> = runtime.FieldRef<Model, FieldType>

  type FieldRefInputType<Model, FieldType> = Model extends never ? never : FieldRef<Model, FieldType>


  export const ModelName: {
    User: 'User',
    CourseTag: 'CourseTag',
    Course: 'Course',
    CourseModule: 'CourseModule',
    CourseLesson: 'CourseLesson'
  };

  export type ModelName = (typeof ModelName)[keyof typeof ModelName]



  interface TypeMapCb<ClientOptions = {}> extends $Utils.Fn<{extArgs: $Extensions.InternalArgs }, $Utils.Record<string, any>> {
    returns: Prisma.TypeMap<this['params']['extArgs'], ClientOptions extends { omit: infer OmitOptions } ? OmitOptions : {}>
  }

  export type TypeMap<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> = {
    globalOmitOptions: {
      omit: GlobalOmitOptions
    }
    meta: {
      modelProps: "user" | "courseTag" | "course" | "courseModule" | "courseLesson"
      txIsolationLevel: Prisma.TransactionIsolationLevel
    }
    model: {
      User: {
        payload: Prisma.$UserPayload<ExtArgs>
        fields: Prisma.UserFieldRefs
        operations: {
          findUnique: {
            args: Prisma.UserFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.UserFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          findFirst: {
            args: Prisma.UserFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.UserFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          findMany: {
            args: Prisma.UserFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>[]
          }
          create: {
            args: Prisma.UserCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          createMany: {
            args: Prisma.UserCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.UserCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>[]
          }
          delete: {
            args: Prisma.UserDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          update: {
            args: Prisma.UserUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          deleteMany: {
            args: Prisma.UserDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.UserUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.UserUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>[]
          }
          upsert: {
            args: Prisma.UserUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          aggregate: {
            args: Prisma.UserAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateUser>
          }
          groupBy: {
            args: Prisma.UserGroupByArgs<ExtArgs>
            result: $Utils.Optional<UserGroupByOutputType>[]
          }
          count: {
            args: Prisma.UserCountArgs<ExtArgs>
            result: $Utils.Optional<UserCountAggregateOutputType> | number
          }
        }
      }
      CourseTag: {
        payload: Prisma.$CourseTagPayload<ExtArgs>
        fields: Prisma.CourseTagFieldRefs
        operations: {
          findUnique: {
            args: Prisma.CourseTagFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CourseTagPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.CourseTagFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CourseTagPayload>
          }
          findFirst: {
            args: Prisma.CourseTagFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CourseTagPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.CourseTagFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CourseTagPayload>
          }
          findMany: {
            args: Prisma.CourseTagFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CourseTagPayload>[]
          }
          create: {
            args: Prisma.CourseTagCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CourseTagPayload>
          }
          createMany: {
            args: Prisma.CourseTagCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.CourseTagCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CourseTagPayload>[]
          }
          delete: {
            args: Prisma.CourseTagDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CourseTagPayload>
          }
          update: {
            args: Prisma.CourseTagUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CourseTagPayload>
          }
          deleteMany: {
            args: Prisma.CourseTagDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.CourseTagUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.CourseTagUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CourseTagPayload>[]
          }
          upsert: {
            args: Prisma.CourseTagUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CourseTagPayload>
          }
          aggregate: {
            args: Prisma.CourseTagAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateCourseTag>
          }
          groupBy: {
            args: Prisma.CourseTagGroupByArgs<ExtArgs>
            result: $Utils.Optional<CourseTagGroupByOutputType>[]
          }
          count: {
            args: Prisma.CourseTagCountArgs<ExtArgs>
            result: $Utils.Optional<CourseTagCountAggregateOutputType> | number
          }
        }
      }
      Course: {
        payload: Prisma.$CoursePayload<ExtArgs>
        fields: Prisma.CourseFieldRefs
        operations: {
          findUnique: {
            args: Prisma.CourseFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CoursePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.CourseFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CoursePayload>
          }
          findFirst: {
            args: Prisma.CourseFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CoursePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.CourseFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CoursePayload>
          }
          findMany: {
            args: Prisma.CourseFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CoursePayload>[]
          }
          create: {
            args: Prisma.CourseCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CoursePayload>
          }
          createMany: {
            args: Prisma.CourseCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.CourseCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CoursePayload>[]
          }
          delete: {
            args: Prisma.CourseDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CoursePayload>
          }
          update: {
            args: Prisma.CourseUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CoursePayload>
          }
          deleteMany: {
            args: Prisma.CourseDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.CourseUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.CourseUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CoursePayload>[]
          }
          upsert: {
            args: Prisma.CourseUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CoursePayload>
          }
          aggregate: {
            args: Prisma.CourseAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateCourse>
          }
          groupBy: {
            args: Prisma.CourseGroupByArgs<ExtArgs>
            result: $Utils.Optional<CourseGroupByOutputType>[]
          }
          count: {
            args: Prisma.CourseCountArgs<ExtArgs>
            result: $Utils.Optional<CourseCountAggregateOutputType> | number
          }
        }
      }
      CourseModule: {
        payload: Prisma.$CourseModulePayload<ExtArgs>
        fields: Prisma.CourseModuleFieldRefs
        operations: {
          findUnique: {
            args: Prisma.CourseModuleFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CourseModulePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.CourseModuleFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CourseModulePayload>
          }
          findFirst: {
            args: Prisma.CourseModuleFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CourseModulePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.CourseModuleFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CourseModulePayload>
          }
          findMany: {
            args: Prisma.CourseModuleFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CourseModulePayload>[]
          }
          create: {
            args: Prisma.CourseModuleCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CourseModulePayload>
          }
          createMany: {
            args: Prisma.CourseModuleCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.CourseModuleCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CourseModulePayload>[]
          }
          delete: {
            args: Prisma.CourseModuleDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CourseModulePayload>
          }
          update: {
            args: Prisma.CourseModuleUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CourseModulePayload>
          }
          deleteMany: {
            args: Prisma.CourseModuleDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.CourseModuleUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.CourseModuleUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CourseModulePayload>[]
          }
          upsert: {
            args: Prisma.CourseModuleUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CourseModulePayload>
          }
          aggregate: {
            args: Prisma.CourseModuleAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateCourseModule>
          }
          groupBy: {
            args: Prisma.CourseModuleGroupByArgs<ExtArgs>
            result: $Utils.Optional<CourseModuleGroupByOutputType>[]
          }
          count: {
            args: Prisma.CourseModuleCountArgs<ExtArgs>
            result: $Utils.Optional<CourseModuleCountAggregateOutputType> | number
          }
        }
      }
      CourseLesson: {
        payload: Prisma.$CourseLessonPayload<ExtArgs>
        fields: Prisma.CourseLessonFieldRefs
        operations: {
          findUnique: {
            args: Prisma.CourseLessonFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CourseLessonPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.CourseLessonFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CourseLessonPayload>
          }
          findFirst: {
            args: Prisma.CourseLessonFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CourseLessonPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.CourseLessonFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CourseLessonPayload>
          }
          findMany: {
            args: Prisma.CourseLessonFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CourseLessonPayload>[]
          }
          create: {
            args: Prisma.CourseLessonCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CourseLessonPayload>
          }
          createMany: {
            args: Prisma.CourseLessonCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.CourseLessonCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CourseLessonPayload>[]
          }
          delete: {
            args: Prisma.CourseLessonDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CourseLessonPayload>
          }
          update: {
            args: Prisma.CourseLessonUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CourseLessonPayload>
          }
          deleteMany: {
            args: Prisma.CourseLessonDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.CourseLessonUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.CourseLessonUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CourseLessonPayload>[]
          }
          upsert: {
            args: Prisma.CourseLessonUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CourseLessonPayload>
          }
          aggregate: {
            args: Prisma.CourseLessonAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateCourseLesson>
          }
          groupBy: {
            args: Prisma.CourseLessonGroupByArgs<ExtArgs>
            result: $Utils.Optional<CourseLessonGroupByOutputType>[]
          }
          count: {
            args: Prisma.CourseLessonCountArgs<ExtArgs>
            result: $Utils.Optional<CourseLessonCountAggregateOutputType> | number
          }
        }
      }
    }
  } & {
    other: {
      payload: any
      operations: {
        $executeRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $executeRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
        $queryRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $queryRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
      }
    }
  }
  export const defineExtension: $Extensions.ExtendsHook<"define", Prisma.TypeMapCb, $Extensions.DefaultArgs>
  export type DefaultPrismaClient = PrismaClient
  export type ErrorFormat = 'pretty' | 'colorless' | 'minimal'
  export interface PrismaClientOptions {
    /**
     * @default "colorless"
     */
    errorFormat?: ErrorFormat
    /**
     * @example
     * ```
     * // Shorthand for `emit: 'stdout'`
     * log: ['query', 'info', 'warn', 'error']
     * 
     * // Emit as events only
     * log: [
     *   { emit: 'event', level: 'query' },
     *   { emit: 'event', level: 'info' },
     *   { emit: 'event', level: 'warn' }
     *   { emit: 'event', level: 'error' }
     * ]
     * 
     * / Emit as events and log to stdout
     * og: [
     *  { emit: 'stdout', level: 'query' },
     *  { emit: 'stdout', level: 'info' },
     *  { emit: 'stdout', level: 'warn' }
     *  { emit: 'stdout', level: 'error' }
     * 
     * ```
     * Read more in our [docs](https://pris.ly/d/logging).
     */
    log?: (LogLevel | LogDefinition)[]
    /**
     * The default values for transactionOptions
     * maxWait ?= 2000
     * timeout ?= 5000
     */
    transactionOptions?: {
      maxWait?: number
      timeout?: number
      isolationLevel?: Prisma.TransactionIsolationLevel
    }
    /**
     * Instance of a Driver Adapter, e.g., like one provided by `@prisma/adapter-planetscale`
     */
    adapter?: runtime.SqlDriverAdapterFactory
    /**
     * Prisma Accelerate URL allowing the client to connect through Accelerate instead of a direct database.
     */
    accelerateUrl?: string
    /**
     * Global configuration for omitting model fields by default.
     * 
     * @example
     * ```
     * const prisma = new PrismaClient({
     *   omit: {
     *     user: {
     *       password: true
     *     }
     *   }
     * })
     * ```
     */
    omit?: Prisma.GlobalOmitConfig
    /**
     * SQL commenter plugins that add metadata to SQL queries as comments.
     * Comments follow the sqlcommenter format: https://google.github.io/sqlcommenter/
     * 
     * @example
     * ```
     * const prisma = new PrismaClient({
     *   adapter,
     *   comments: [
     *     traceContext(),
     *     queryInsights(),
     *   ],
     * })
     * ```
     */
    comments?: runtime.SqlCommenterPlugin[]
  }
  export type GlobalOmitConfig = {
    user?: UserOmit
    courseTag?: CourseTagOmit
    course?: CourseOmit
    courseModule?: CourseModuleOmit
    courseLesson?: CourseLessonOmit
  }

  /* Types for Logging */
  export type LogLevel = 'info' | 'query' | 'warn' | 'error'
  export type LogDefinition = {
    level: LogLevel
    emit: 'stdout' | 'event'
  }

  export type CheckIsLogLevel<T> = T extends LogLevel ? T : never;

  export type GetLogType<T> = CheckIsLogLevel<
    T extends LogDefinition ? T['level'] : T
  >;

  export type GetEvents<T extends any[]> = T extends Array<LogLevel | LogDefinition>
    ? GetLogType<T[number]>
    : never;

  export type QueryEvent = {
    timestamp: Date
    query: string
    params: string
    duration: number
    target: string
  }

  export type LogEvent = {
    timestamp: Date
    message: string
    target: string
  }
  /* End Types for Logging */


  export type PrismaAction =
    | 'findUnique'
    | 'findUniqueOrThrow'
    | 'findMany'
    | 'findFirst'
    | 'findFirstOrThrow'
    | 'create'
    | 'createMany'
    | 'createManyAndReturn'
    | 'update'
    | 'updateMany'
    | 'updateManyAndReturn'
    | 'upsert'
    | 'delete'
    | 'deleteMany'
    | 'executeRaw'
    | 'queryRaw'
    | 'aggregate'
    | 'count'
    | 'runCommandRaw'
    | 'findRaw'
    | 'groupBy'

  // tested in getLogLevel.test.ts
  export function getLogLevel(log: Array<LogLevel | LogDefinition>): LogLevel | undefined;

  /**
   * `PrismaClient` proxy available in interactive transactions.
   */
  export type TransactionClient = Omit<Prisma.DefaultPrismaClient, runtime.ITXClientDenyList>

  export type Datasource = {
    url?: string
  }

  /**
   * Count Types
   */


  /**
   * Count Type CourseCountOutputType
   */

  export type CourseCountOutputType = {
    tags: number
    modules: number
  }

  export type CourseCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    tags?: boolean | CourseCountOutputTypeCountTagsArgs
    modules?: boolean | CourseCountOutputTypeCountModulesArgs
  }

  // Custom InputTypes
  /**
   * CourseCountOutputType without action
   */
  export type CourseCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CourseCountOutputType
     */
    select?: CourseCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * CourseCountOutputType without action
   */
  export type CourseCountOutputTypeCountTagsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: CourseTagWhereInput
  }

  /**
   * CourseCountOutputType without action
   */
  export type CourseCountOutputTypeCountModulesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: CourseModuleWhereInput
  }


  /**
   * Count Type CourseModuleCountOutputType
   */

  export type CourseModuleCountOutputType = {
    lessons: number
  }

  export type CourseModuleCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    lessons?: boolean | CourseModuleCountOutputTypeCountLessonsArgs
  }

  // Custom InputTypes
  /**
   * CourseModuleCountOutputType without action
   */
  export type CourseModuleCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CourseModuleCountOutputType
     */
    select?: CourseModuleCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * CourseModuleCountOutputType without action
   */
  export type CourseModuleCountOutputTypeCountLessonsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: CourseLessonWhereInput
  }


  /**
   * Models
   */

  /**
   * Model User
   */

  export type AggregateUser = {
    _count: UserCountAggregateOutputType | null
    _min: UserMinAggregateOutputType | null
    _max: UserMaxAggregateOutputType | null
  }

  export type UserMinAggregateOutputType = {
    id: string | null
    firstName: string | null
    lastName: string | null
    email: string | null
    clerkUserId: string | null
    imageUrl: string | null
    createdAt: Date | null
    updateAt: Date | null
  }

  export type UserMaxAggregateOutputType = {
    id: string | null
    firstName: string | null
    lastName: string | null
    email: string | null
    clerkUserId: string | null
    imageUrl: string | null
    createdAt: Date | null
    updateAt: Date | null
  }

  export type UserCountAggregateOutputType = {
    id: number
    firstName: number
    lastName: number
    email: number
    clerkUserId: number
    imageUrl: number
    createdAt: number
    updateAt: number
    _all: number
  }


  export type UserMinAggregateInputType = {
    id?: true
    firstName?: true
    lastName?: true
    email?: true
    clerkUserId?: true
    imageUrl?: true
    createdAt?: true
    updateAt?: true
  }

  export type UserMaxAggregateInputType = {
    id?: true
    firstName?: true
    lastName?: true
    email?: true
    clerkUserId?: true
    imageUrl?: true
    createdAt?: true
    updateAt?: true
  }

  export type UserCountAggregateInputType = {
    id?: true
    firstName?: true
    lastName?: true
    email?: true
    clerkUserId?: true
    imageUrl?: true
    createdAt?: true
    updateAt?: true
    _all?: true
  }

  export type UserAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which User to aggregate.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Users
    **/
    _count?: true | UserCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: UserMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: UserMaxAggregateInputType
  }

  export type GetUserAggregateType<T extends UserAggregateArgs> = {
        [P in keyof T & keyof AggregateUser]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateUser[P]>
      : GetScalarType<T[P], AggregateUser[P]>
  }




  export type UserGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: UserWhereInput
    orderBy?: UserOrderByWithAggregationInput | UserOrderByWithAggregationInput[]
    by: UserScalarFieldEnum[] | UserScalarFieldEnum
    having?: UserScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: UserCountAggregateInputType | true
    _min?: UserMinAggregateInputType
    _max?: UserMaxAggregateInputType
  }

  export type UserGroupByOutputType = {
    id: string
    firstName: string
    lastName: string | null
    email: string
    clerkUserId: string
    imageUrl: string | null
    createdAt: Date
    updateAt: Date
    _count: UserCountAggregateOutputType | null
    _min: UserMinAggregateOutputType | null
    _max: UserMaxAggregateOutputType | null
  }

  type GetUserGroupByPayload<T extends UserGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<UserGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof UserGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], UserGroupByOutputType[P]>
            : GetScalarType<T[P], UserGroupByOutputType[P]>
        }
      >
    >


  export type UserSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    firstName?: boolean
    lastName?: boolean
    email?: boolean
    clerkUserId?: boolean
    imageUrl?: boolean
    createdAt?: boolean
    updateAt?: boolean
  }, ExtArgs["result"]["user"]>

  export type UserSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    firstName?: boolean
    lastName?: boolean
    email?: boolean
    clerkUserId?: boolean
    imageUrl?: boolean
    createdAt?: boolean
    updateAt?: boolean
  }, ExtArgs["result"]["user"]>

  export type UserSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    firstName?: boolean
    lastName?: boolean
    email?: boolean
    clerkUserId?: boolean
    imageUrl?: boolean
    createdAt?: boolean
    updateAt?: boolean
  }, ExtArgs["result"]["user"]>

  export type UserSelectScalar = {
    id?: boolean
    firstName?: boolean
    lastName?: boolean
    email?: boolean
    clerkUserId?: boolean
    imageUrl?: boolean
    createdAt?: boolean
    updateAt?: boolean
  }

  export type UserOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "firstName" | "lastName" | "email" | "clerkUserId" | "imageUrl" | "createdAt" | "updateAt", ExtArgs["result"]["user"]>

  export type $UserPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "User"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      firstName: string
      lastName: string | null
      email: string
      clerkUserId: string
      imageUrl: string | null
      createdAt: Date
      updateAt: Date
    }, ExtArgs["result"]["user"]>
    composites: {}
  }

  type UserGetPayload<S extends boolean | null | undefined | UserDefaultArgs> = $Result.GetResult<Prisma.$UserPayload, S>

  type UserCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<UserFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: UserCountAggregateInputType | true
    }

  export interface UserDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['User'], meta: { name: 'User' } }
    /**
     * Find zero or one User that matches the filter.
     * @param {UserFindUniqueArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends UserFindUniqueArgs>(args: SelectSubset<T, UserFindUniqueArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one User that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {UserFindUniqueOrThrowArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends UserFindUniqueOrThrowArgs>(args: SelectSubset<T, UserFindUniqueOrThrowArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first User that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindFirstArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends UserFindFirstArgs>(args?: SelectSubset<T, UserFindFirstArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first User that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindFirstOrThrowArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends UserFindFirstOrThrowArgs>(args?: SelectSubset<T, UserFindFirstOrThrowArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Users that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Users
     * const users = await prisma.user.findMany()
     * 
     * // Get first 10 Users
     * const users = await prisma.user.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const userWithIdOnly = await prisma.user.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends UserFindManyArgs>(args?: SelectSubset<T, UserFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a User.
     * @param {UserCreateArgs} args - Arguments to create a User.
     * @example
     * // Create one User
     * const User = await prisma.user.create({
     *   data: {
     *     // ... data to create a User
     *   }
     * })
     * 
     */
    create<T extends UserCreateArgs>(args: SelectSubset<T, UserCreateArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Users.
     * @param {UserCreateManyArgs} args - Arguments to create many Users.
     * @example
     * // Create many Users
     * const user = await prisma.user.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends UserCreateManyArgs>(args?: SelectSubset<T, UserCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Users and returns the data saved in the database.
     * @param {UserCreateManyAndReturnArgs} args - Arguments to create many Users.
     * @example
     * // Create many Users
     * const user = await prisma.user.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Users and only return the `id`
     * const userWithIdOnly = await prisma.user.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends UserCreateManyAndReturnArgs>(args?: SelectSubset<T, UserCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a User.
     * @param {UserDeleteArgs} args - Arguments to delete one User.
     * @example
     * // Delete one User
     * const User = await prisma.user.delete({
     *   where: {
     *     // ... filter to delete one User
     *   }
     * })
     * 
     */
    delete<T extends UserDeleteArgs>(args: SelectSubset<T, UserDeleteArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one User.
     * @param {UserUpdateArgs} args - Arguments to update one User.
     * @example
     * // Update one User
     * const user = await prisma.user.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends UserUpdateArgs>(args: SelectSubset<T, UserUpdateArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Users.
     * @param {UserDeleteManyArgs} args - Arguments to filter Users to delete.
     * @example
     * // Delete a few Users
     * const { count } = await prisma.user.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends UserDeleteManyArgs>(args?: SelectSubset<T, UserDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Users.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Users
     * const user = await prisma.user.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends UserUpdateManyArgs>(args: SelectSubset<T, UserUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Users and returns the data updated in the database.
     * @param {UserUpdateManyAndReturnArgs} args - Arguments to update many Users.
     * @example
     * // Update many Users
     * const user = await prisma.user.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Users and only return the `id`
     * const userWithIdOnly = await prisma.user.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends UserUpdateManyAndReturnArgs>(args: SelectSubset<T, UserUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one User.
     * @param {UserUpsertArgs} args - Arguments to update or create a User.
     * @example
     * // Update or create a User
     * const user = await prisma.user.upsert({
     *   create: {
     *     // ... data to create a User
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the User we want to update
     *   }
     * })
     */
    upsert<T extends UserUpsertArgs>(args: SelectSubset<T, UserUpsertArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Users.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserCountArgs} args - Arguments to filter Users to count.
     * @example
     * // Count the number of Users
     * const count = await prisma.user.count({
     *   where: {
     *     // ... the filter for the Users we want to count
     *   }
     * })
    **/
    count<T extends UserCountArgs>(
      args?: Subset<T, UserCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], UserCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a User.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends UserAggregateArgs>(args: Subset<T, UserAggregateArgs>): Prisma.PrismaPromise<GetUserAggregateType<T>>

    /**
     * Group by User.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends UserGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: UserGroupByArgs['orderBy'] }
        : { orderBy?: UserGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, UserGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetUserGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the User model
   */
  readonly fields: UserFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for User.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__UserClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the User model
   */
  interface UserFieldRefs {
    readonly id: FieldRef<"User", 'String'>
    readonly firstName: FieldRef<"User", 'String'>
    readonly lastName: FieldRef<"User", 'String'>
    readonly email: FieldRef<"User", 'String'>
    readonly clerkUserId: FieldRef<"User", 'String'>
    readonly imageUrl: FieldRef<"User", 'String'>
    readonly createdAt: FieldRef<"User", 'DateTime'>
    readonly updateAt: FieldRef<"User", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * User findUnique
   */
  export type UserFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User findUniqueOrThrow
   */
  export type UserFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User findFirst
   */
  export type UserFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Users.
     */
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * User findFirstOrThrow
   */
  export type UserFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Users.
     */
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * User findMany
   */
  export type UserFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Filter, which Users to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Users.
     */
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * User create
   */
  export type UserCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * The data needed to create a User.
     */
    data: XOR<UserCreateInput, UserUncheckedCreateInput>
  }

  /**
   * User createMany
   */
  export type UserCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Users.
     */
    data: UserCreateManyInput | UserCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * User createManyAndReturn
   */
  export type UserCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * The data used to create many Users.
     */
    data: UserCreateManyInput | UserCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * User update
   */
  export type UserUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * The data needed to update a User.
     */
    data: XOR<UserUpdateInput, UserUncheckedUpdateInput>
    /**
     * Choose, which User to update.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User updateMany
   */
  export type UserUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Users.
     */
    data: XOR<UserUpdateManyMutationInput, UserUncheckedUpdateManyInput>
    /**
     * Filter which Users to update
     */
    where?: UserWhereInput
    /**
     * Limit how many Users to update.
     */
    limit?: number
  }

  /**
   * User updateManyAndReturn
   */
  export type UserUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * The data used to update Users.
     */
    data: XOR<UserUpdateManyMutationInput, UserUncheckedUpdateManyInput>
    /**
     * Filter which Users to update
     */
    where?: UserWhereInput
    /**
     * Limit how many Users to update.
     */
    limit?: number
  }

  /**
   * User upsert
   */
  export type UserUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * The filter to search for the User to update in case it exists.
     */
    where: UserWhereUniqueInput
    /**
     * In case the User found by the `where` argument doesn't exist, create a new User with this data.
     */
    create: XOR<UserCreateInput, UserUncheckedCreateInput>
    /**
     * In case the User was found with the provided `where` argument, update it with this data.
     */
    update: XOR<UserUpdateInput, UserUncheckedUpdateInput>
  }

  /**
   * User delete
   */
  export type UserDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Filter which User to delete.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User deleteMany
   */
  export type UserDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Users to delete
     */
    where?: UserWhereInput
    /**
     * Limit how many Users to delete.
     */
    limit?: number
  }

  /**
   * User without action
   */
  export type UserDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
  }


  /**
   * Model CourseTag
   */

  export type AggregateCourseTag = {
    _count: CourseTagCountAggregateOutputType | null
    _min: CourseTagMinAggregateOutputType | null
    _max: CourseTagMaxAggregateOutputType | null
  }

  export type CourseTagMinAggregateOutputType = {
    id: string | null
    name: string | null
    createdAt: Date | null
    updateAt: Date | null
    courseId: string | null
  }

  export type CourseTagMaxAggregateOutputType = {
    id: string | null
    name: string | null
    createdAt: Date | null
    updateAt: Date | null
    courseId: string | null
  }

  export type CourseTagCountAggregateOutputType = {
    id: number
    name: number
    createdAt: number
    updateAt: number
    courseId: number
    _all: number
  }


  export type CourseTagMinAggregateInputType = {
    id?: true
    name?: true
    createdAt?: true
    updateAt?: true
    courseId?: true
  }

  export type CourseTagMaxAggregateInputType = {
    id?: true
    name?: true
    createdAt?: true
    updateAt?: true
    courseId?: true
  }

  export type CourseTagCountAggregateInputType = {
    id?: true
    name?: true
    createdAt?: true
    updateAt?: true
    courseId?: true
    _all?: true
  }

  export type CourseTagAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which CourseTag to aggregate.
     */
    where?: CourseTagWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CourseTags to fetch.
     */
    orderBy?: CourseTagOrderByWithRelationInput | CourseTagOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: CourseTagWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CourseTags from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CourseTags.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned CourseTags
    **/
    _count?: true | CourseTagCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: CourseTagMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: CourseTagMaxAggregateInputType
  }

  export type GetCourseTagAggregateType<T extends CourseTagAggregateArgs> = {
        [P in keyof T & keyof AggregateCourseTag]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateCourseTag[P]>
      : GetScalarType<T[P], AggregateCourseTag[P]>
  }




  export type CourseTagGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: CourseTagWhereInput
    orderBy?: CourseTagOrderByWithAggregationInput | CourseTagOrderByWithAggregationInput[]
    by: CourseTagScalarFieldEnum[] | CourseTagScalarFieldEnum
    having?: CourseTagScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: CourseTagCountAggregateInputType | true
    _min?: CourseTagMinAggregateInputType
    _max?: CourseTagMaxAggregateInputType
  }

  export type CourseTagGroupByOutputType = {
    id: string
    name: string
    createdAt: Date
    updateAt: Date
    courseId: string | null
    _count: CourseTagCountAggregateOutputType | null
    _min: CourseTagMinAggregateOutputType | null
    _max: CourseTagMaxAggregateOutputType | null
  }

  type GetCourseTagGroupByPayload<T extends CourseTagGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<CourseTagGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof CourseTagGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], CourseTagGroupByOutputType[P]>
            : GetScalarType<T[P], CourseTagGroupByOutputType[P]>
        }
      >
    >


  export type CourseTagSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    createdAt?: boolean
    updateAt?: boolean
    courseId?: boolean
    course?: boolean | CourseTag$courseArgs<ExtArgs>
  }, ExtArgs["result"]["courseTag"]>

  export type CourseTagSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    createdAt?: boolean
    updateAt?: boolean
    courseId?: boolean
    course?: boolean | CourseTag$courseArgs<ExtArgs>
  }, ExtArgs["result"]["courseTag"]>

  export type CourseTagSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    createdAt?: boolean
    updateAt?: boolean
    courseId?: boolean
    course?: boolean | CourseTag$courseArgs<ExtArgs>
  }, ExtArgs["result"]["courseTag"]>

  export type CourseTagSelectScalar = {
    id?: boolean
    name?: boolean
    createdAt?: boolean
    updateAt?: boolean
    courseId?: boolean
  }

  export type CourseTagOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "name" | "createdAt" | "updateAt" | "courseId", ExtArgs["result"]["courseTag"]>
  export type CourseTagInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    course?: boolean | CourseTag$courseArgs<ExtArgs>
  }
  export type CourseTagIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    course?: boolean | CourseTag$courseArgs<ExtArgs>
  }
  export type CourseTagIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    course?: boolean | CourseTag$courseArgs<ExtArgs>
  }

  export type $CourseTagPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "CourseTag"
    objects: {
      course: Prisma.$CoursePayload<ExtArgs> | null
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      name: string
      createdAt: Date
      updateAt: Date
      courseId: string | null
    }, ExtArgs["result"]["courseTag"]>
    composites: {}
  }

  type CourseTagGetPayload<S extends boolean | null | undefined | CourseTagDefaultArgs> = $Result.GetResult<Prisma.$CourseTagPayload, S>

  type CourseTagCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<CourseTagFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: CourseTagCountAggregateInputType | true
    }

  export interface CourseTagDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['CourseTag'], meta: { name: 'CourseTag' } }
    /**
     * Find zero or one CourseTag that matches the filter.
     * @param {CourseTagFindUniqueArgs} args - Arguments to find a CourseTag
     * @example
     * // Get one CourseTag
     * const courseTag = await prisma.courseTag.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends CourseTagFindUniqueArgs>(args: SelectSubset<T, CourseTagFindUniqueArgs<ExtArgs>>): Prisma__CourseTagClient<$Result.GetResult<Prisma.$CourseTagPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one CourseTag that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {CourseTagFindUniqueOrThrowArgs} args - Arguments to find a CourseTag
     * @example
     * // Get one CourseTag
     * const courseTag = await prisma.courseTag.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends CourseTagFindUniqueOrThrowArgs>(args: SelectSubset<T, CourseTagFindUniqueOrThrowArgs<ExtArgs>>): Prisma__CourseTagClient<$Result.GetResult<Prisma.$CourseTagPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first CourseTag that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CourseTagFindFirstArgs} args - Arguments to find a CourseTag
     * @example
     * // Get one CourseTag
     * const courseTag = await prisma.courseTag.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends CourseTagFindFirstArgs>(args?: SelectSubset<T, CourseTagFindFirstArgs<ExtArgs>>): Prisma__CourseTagClient<$Result.GetResult<Prisma.$CourseTagPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first CourseTag that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CourseTagFindFirstOrThrowArgs} args - Arguments to find a CourseTag
     * @example
     * // Get one CourseTag
     * const courseTag = await prisma.courseTag.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends CourseTagFindFirstOrThrowArgs>(args?: SelectSubset<T, CourseTagFindFirstOrThrowArgs<ExtArgs>>): Prisma__CourseTagClient<$Result.GetResult<Prisma.$CourseTagPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more CourseTags that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CourseTagFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all CourseTags
     * const courseTags = await prisma.courseTag.findMany()
     * 
     * // Get first 10 CourseTags
     * const courseTags = await prisma.courseTag.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const courseTagWithIdOnly = await prisma.courseTag.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends CourseTagFindManyArgs>(args?: SelectSubset<T, CourseTagFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CourseTagPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a CourseTag.
     * @param {CourseTagCreateArgs} args - Arguments to create a CourseTag.
     * @example
     * // Create one CourseTag
     * const CourseTag = await prisma.courseTag.create({
     *   data: {
     *     // ... data to create a CourseTag
     *   }
     * })
     * 
     */
    create<T extends CourseTagCreateArgs>(args: SelectSubset<T, CourseTagCreateArgs<ExtArgs>>): Prisma__CourseTagClient<$Result.GetResult<Prisma.$CourseTagPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many CourseTags.
     * @param {CourseTagCreateManyArgs} args - Arguments to create many CourseTags.
     * @example
     * // Create many CourseTags
     * const courseTag = await prisma.courseTag.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends CourseTagCreateManyArgs>(args?: SelectSubset<T, CourseTagCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many CourseTags and returns the data saved in the database.
     * @param {CourseTagCreateManyAndReturnArgs} args - Arguments to create many CourseTags.
     * @example
     * // Create many CourseTags
     * const courseTag = await prisma.courseTag.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many CourseTags and only return the `id`
     * const courseTagWithIdOnly = await prisma.courseTag.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends CourseTagCreateManyAndReturnArgs>(args?: SelectSubset<T, CourseTagCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CourseTagPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a CourseTag.
     * @param {CourseTagDeleteArgs} args - Arguments to delete one CourseTag.
     * @example
     * // Delete one CourseTag
     * const CourseTag = await prisma.courseTag.delete({
     *   where: {
     *     // ... filter to delete one CourseTag
     *   }
     * })
     * 
     */
    delete<T extends CourseTagDeleteArgs>(args: SelectSubset<T, CourseTagDeleteArgs<ExtArgs>>): Prisma__CourseTagClient<$Result.GetResult<Prisma.$CourseTagPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one CourseTag.
     * @param {CourseTagUpdateArgs} args - Arguments to update one CourseTag.
     * @example
     * // Update one CourseTag
     * const courseTag = await prisma.courseTag.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends CourseTagUpdateArgs>(args: SelectSubset<T, CourseTagUpdateArgs<ExtArgs>>): Prisma__CourseTagClient<$Result.GetResult<Prisma.$CourseTagPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more CourseTags.
     * @param {CourseTagDeleteManyArgs} args - Arguments to filter CourseTags to delete.
     * @example
     * // Delete a few CourseTags
     * const { count } = await prisma.courseTag.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends CourseTagDeleteManyArgs>(args?: SelectSubset<T, CourseTagDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more CourseTags.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CourseTagUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many CourseTags
     * const courseTag = await prisma.courseTag.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends CourseTagUpdateManyArgs>(args: SelectSubset<T, CourseTagUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more CourseTags and returns the data updated in the database.
     * @param {CourseTagUpdateManyAndReturnArgs} args - Arguments to update many CourseTags.
     * @example
     * // Update many CourseTags
     * const courseTag = await prisma.courseTag.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more CourseTags and only return the `id`
     * const courseTagWithIdOnly = await prisma.courseTag.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends CourseTagUpdateManyAndReturnArgs>(args: SelectSubset<T, CourseTagUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CourseTagPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one CourseTag.
     * @param {CourseTagUpsertArgs} args - Arguments to update or create a CourseTag.
     * @example
     * // Update or create a CourseTag
     * const courseTag = await prisma.courseTag.upsert({
     *   create: {
     *     // ... data to create a CourseTag
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the CourseTag we want to update
     *   }
     * })
     */
    upsert<T extends CourseTagUpsertArgs>(args: SelectSubset<T, CourseTagUpsertArgs<ExtArgs>>): Prisma__CourseTagClient<$Result.GetResult<Prisma.$CourseTagPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of CourseTags.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CourseTagCountArgs} args - Arguments to filter CourseTags to count.
     * @example
     * // Count the number of CourseTags
     * const count = await prisma.courseTag.count({
     *   where: {
     *     // ... the filter for the CourseTags we want to count
     *   }
     * })
    **/
    count<T extends CourseTagCountArgs>(
      args?: Subset<T, CourseTagCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], CourseTagCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a CourseTag.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CourseTagAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends CourseTagAggregateArgs>(args: Subset<T, CourseTagAggregateArgs>): Prisma.PrismaPromise<GetCourseTagAggregateType<T>>

    /**
     * Group by CourseTag.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CourseTagGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends CourseTagGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: CourseTagGroupByArgs['orderBy'] }
        : { orderBy?: CourseTagGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, CourseTagGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetCourseTagGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the CourseTag model
   */
  readonly fields: CourseTagFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for CourseTag.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__CourseTagClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    course<T extends CourseTag$courseArgs<ExtArgs> = {}>(args?: Subset<T, CourseTag$courseArgs<ExtArgs>>): Prisma__CourseClient<$Result.GetResult<Prisma.$CoursePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the CourseTag model
   */
  interface CourseTagFieldRefs {
    readonly id: FieldRef<"CourseTag", 'String'>
    readonly name: FieldRef<"CourseTag", 'String'>
    readonly createdAt: FieldRef<"CourseTag", 'DateTime'>
    readonly updateAt: FieldRef<"CourseTag", 'DateTime'>
    readonly courseId: FieldRef<"CourseTag", 'String'>
  }
    

  // Custom InputTypes
  /**
   * CourseTag findUnique
   */
  export type CourseTagFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CourseTag
     */
    select?: CourseTagSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CourseTag
     */
    omit?: CourseTagOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CourseTagInclude<ExtArgs> | null
    /**
     * Filter, which CourseTag to fetch.
     */
    where: CourseTagWhereUniqueInput
  }

  /**
   * CourseTag findUniqueOrThrow
   */
  export type CourseTagFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CourseTag
     */
    select?: CourseTagSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CourseTag
     */
    omit?: CourseTagOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CourseTagInclude<ExtArgs> | null
    /**
     * Filter, which CourseTag to fetch.
     */
    where: CourseTagWhereUniqueInput
  }

  /**
   * CourseTag findFirst
   */
  export type CourseTagFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CourseTag
     */
    select?: CourseTagSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CourseTag
     */
    omit?: CourseTagOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CourseTagInclude<ExtArgs> | null
    /**
     * Filter, which CourseTag to fetch.
     */
    where?: CourseTagWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CourseTags to fetch.
     */
    orderBy?: CourseTagOrderByWithRelationInput | CourseTagOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for CourseTags.
     */
    cursor?: CourseTagWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CourseTags from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CourseTags.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of CourseTags.
     */
    distinct?: CourseTagScalarFieldEnum | CourseTagScalarFieldEnum[]
  }

  /**
   * CourseTag findFirstOrThrow
   */
  export type CourseTagFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CourseTag
     */
    select?: CourseTagSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CourseTag
     */
    omit?: CourseTagOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CourseTagInclude<ExtArgs> | null
    /**
     * Filter, which CourseTag to fetch.
     */
    where?: CourseTagWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CourseTags to fetch.
     */
    orderBy?: CourseTagOrderByWithRelationInput | CourseTagOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for CourseTags.
     */
    cursor?: CourseTagWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CourseTags from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CourseTags.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of CourseTags.
     */
    distinct?: CourseTagScalarFieldEnum | CourseTagScalarFieldEnum[]
  }

  /**
   * CourseTag findMany
   */
  export type CourseTagFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CourseTag
     */
    select?: CourseTagSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CourseTag
     */
    omit?: CourseTagOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CourseTagInclude<ExtArgs> | null
    /**
     * Filter, which CourseTags to fetch.
     */
    where?: CourseTagWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CourseTags to fetch.
     */
    orderBy?: CourseTagOrderByWithRelationInput | CourseTagOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing CourseTags.
     */
    cursor?: CourseTagWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CourseTags from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CourseTags.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of CourseTags.
     */
    distinct?: CourseTagScalarFieldEnum | CourseTagScalarFieldEnum[]
  }

  /**
   * CourseTag create
   */
  export type CourseTagCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CourseTag
     */
    select?: CourseTagSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CourseTag
     */
    omit?: CourseTagOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CourseTagInclude<ExtArgs> | null
    /**
     * The data needed to create a CourseTag.
     */
    data: XOR<CourseTagCreateInput, CourseTagUncheckedCreateInput>
  }

  /**
   * CourseTag createMany
   */
  export type CourseTagCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many CourseTags.
     */
    data: CourseTagCreateManyInput | CourseTagCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * CourseTag createManyAndReturn
   */
  export type CourseTagCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CourseTag
     */
    select?: CourseTagSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the CourseTag
     */
    omit?: CourseTagOmit<ExtArgs> | null
    /**
     * The data used to create many CourseTags.
     */
    data: CourseTagCreateManyInput | CourseTagCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CourseTagIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * CourseTag update
   */
  export type CourseTagUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CourseTag
     */
    select?: CourseTagSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CourseTag
     */
    omit?: CourseTagOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CourseTagInclude<ExtArgs> | null
    /**
     * The data needed to update a CourseTag.
     */
    data: XOR<CourseTagUpdateInput, CourseTagUncheckedUpdateInput>
    /**
     * Choose, which CourseTag to update.
     */
    where: CourseTagWhereUniqueInput
  }

  /**
   * CourseTag updateMany
   */
  export type CourseTagUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update CourseTags.
     */
    data: XOR<CourseTagUpdateManyMutationInput, CourseTagUncheckedUpdateManyInput>
    /**
     * Filter which CourseTags to update
     */
    where?: CourseTagWhereInput
    /**
     * Limit how many CourseTags to update.
     */
    limit?: number
  }

  /**
   * CourseTag updateManyAndReturn
   */
  export type CourseTagUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CourseTag
     */
    select?: CourseTagSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the CourseTag
     */
    omit?: CourseTagOmit<ExtArgs> | null
    /**
     * The data used to update CourseTags.
     */
    data: XOR<CourseTagUpdateManyMutationInput, CourseTagUncheckedUpdateManyInput>
    /**
     * Filter which CourseTags to update
     */
    where?: CourseTagWhereInput
    /**
     * Limit how many CourseTags to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CourseTagIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * CourseTag upsert
   */
  export type CourseTagUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CourseTag
     */
    select?: CourseTagSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CourseTag
     */
    omit?: CourseTagOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CourseTagInclude<ExtArgs> | null
    /**
     * The filter to search for the CourseTag to update in case it exists.
     */
    where: CourseTagWhereUniqueInput
    /**
     * In case the CourseTag found by the `where` argument doesn't exist, create a new CourseTag with this data.
     */
    create: XOR<CourseTagCreateInput, CourseTagUncheckedCreateInput>
    /**
     * In case the CourseTag was found with the provided `where` argument, update it with this data.
     */
    update: XOR<CourseTagUpdateInput, CourseTagUncheckedUpdateInput>
  }

  /**
   * CourseTag delete
   */
  export type CourseTagDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CourseTag
     */
    select?: CourseTagSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CourseTag
     */
    omit?: CourseTagOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CourseTagInclude<ExtArgs> | null
    /**
     * Filter which CourseTag to delete.
     */
    where: CourseTagWhereUniqueInput
  }

  /**
   * CourseTag deleteMany
   */
  export type CourseTagDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which CourseTags to delete
     */
    where?: CourseTagWhereInput
    /**
     * Limit how many CourseTags to delete.
     */
    limit?: number
  }

  /**
   * CourseTag.course
   */
  export type CourseTag$courseArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Course
     */
    select?: CourseSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Course
     */
    omit?: CourseOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CourseInclude<ExtArgs> | null
    where?: CourseWhereInput
  }

  /**
   * CourseTag without action
   */
  export type CourseTagDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CourseTag
     */
    select?: CourseTagSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CourseTag
     */
    omit?: CourseTagOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CourseTagInclude<ExtArgs> | null
  }


  /**
   * Model Course
   */

  export type AggregateCourse = {
    _count: CourseCountAggregateOutputType | null
    _avg: CourseAvgAggregateOutputType | null
    _sum: CourseSumAggregateOutputType | null
    _min: CourseMinAggregateOutputType | null
    _max: CourseMaxAggregateOutputType | null
  }

  export type CourseAvgAggregateOutputType = {
    price: number | null
    discountPrice: number | null
  }

  export type CourseSumAggregateOutputType = {
    price: number | null
    discountPrice: number | null
  }

  export type CourseMinAggregateOutputType = {
    id: string | null
    status: $Enums.CourseStatus | null
    title: string | null
    slug: string | null
    description: string | null
    shortDescription: string | null
    thumbnail: string | null
    price: number | null
    discountPrice: number | null
    difficulty: $Enums.CourseDifficulty | null
    createdAt: Date | null
    updateAt: Date | null
  }

  export type CourseMaxAggregateOutputType = {
    id: string | null
    status: $Enums.CourseStatus | null
    title: string | null
    slug: string | null
    description: string | null
    shortDescription: string | null
    thumbnail: string | null
    price: number | null
    discountPrice: number | null
    difficulty: $Enums.CourseDifficulty | null
    createdAt: Date | null
    updateAt: Date | null
  }

  export type CourseCountAggregateOutputType = {
    id: number
    status: number
    title: number
    slug: number
    description: number
    shortDescription: number
    thumbnail: number
    price: number
    discountPrice: number
    difficulty: number
    createdAt: number
    updateAt: number
    _all: number
  }


  export type CourseAvgAggregateInputType = {
    price?: true
    discountPrice?: true
  }

  export type CourseSumAggregateInputType = {
    price?: true
    discountPrice?: true
  }

  export type CourseMinAggregateInputType = {
    id?: true
    status?: true
    title?: true
    slug?: true
    description?: true
    shortDescription?: true
    thumbnail?: true
    price?: true
    discountPrice?: true
    difficulty?: true
    createdAt?: true
    updateAt?: true
  }

  export type CourseMaxAggregateInputType = {
    id?: true
    status?: true
    title?: true
    slug?: true
    description?: true
    shortDescription?: true
    thumbnail?: true
    price?: true
    discountPrice?: true
    difficulty?: true
    createdAt?: true
    updateAt?: true
  }

  export type CourseCountAggregateInputType = {
    id?: true
    status?: true
    title?: true
    slug?: true
    description?: true
    shortDescription?: true
    thumbnail?: true
    price?: true
    discountPrice?: true
    difficulty?: true
    createdAt?: true
    updateAt?: true
    _all?: true
  }

  export type CourseAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Course to aggregate.
     */
    where?: CourseWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Courses to fetch.
     */
    orderBy?: CourseOrderByWithRelationInput | CourseOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: CourseWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Courses from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Courses.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Courses
    **/
    _count?: true | CourseCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: CourseAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: CourseSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: CourseMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: CourseMaxAggregateInputType
  }

  export type GetCourseAggregateType<T extends CourseAggregateArgs> = {
        [P in keyof T & keyof AggregateCourse]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateCourse[P]>
      : GetScalarType<T[P], AggregateCourse[P]>
  }




  export type CourseGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: CourseWhereInput
    orderBy?: CourseOrderByWithAggregationInput | CourseOrderByWithAggregationInput[]
    by: CourseScalarFieldEnum[] | CourseScalarFieldEnum
    having?: CourseScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: CourseCountAggregateInputType | true
    _avg?: CourseAvgAggregateInputType
    _sum?: CourseSumAggregateInputType
    _min?: CourseMinAggregateInputType
    _max?: CourseMaxAggregateInputType
  }

  export type CourseGroupByOutputType = {
    id: string
    status: $Enums.CourseStatus
    title: string
    slug: string
    description: string
    shortDescription: string | null
    thumbnail: string
    price: number
    discountPrice: number | null
    difficulty: $Enums.CourseDifficulty
    createdAt: Date
    updateAt: Date
    _count: CourseCountAggregateOutputType | null
    _avg: CourseAvgAggregateOutputType | null
    _sum: CourseSumAggregateOutputType | null
    _min: CourseMinAggregateOutputType | null
    _max: CourseMaxAggregateOutputType | null
  }

  type GetCourseGroupByPayload<T extends CourseGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<CourseGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof CourseGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], CourseGroupByOutputType[P]>
            : GetScalarType<T[P], CourseGroupByOutputType[P]>
        }
      >
    >


  export type CourseSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    status?: boolean
    title?: boolean
    slug?: boolean
    description?: boolean
    shortDescription?: boolean
    thumbnail?: boolean
    price?: boolean
    discountPrice?: boolean
    difficulty?: boolean
    createdAt?: boolean
    updateAt?: boolean
    tags?: boolean | Course$tagsArgs<ExtArgs>
    modules?: boolean | Course$modulesArgs<ExtArgs>
    _count?: boolean | CourseCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["course"]>

  export type CourseSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    status?: boolean
    title?: boolean
    slug?: boolean
    description?: boolean
    shortDescription?: boolean
    thumbnail?: boolean
    price?: boolean
    discountPrice?: boolean
    difficulty?: boolean
    createdAt?: boolean
    updateAt?: boolean
  }, ExtArgs["result"]["course"]>

  export type CourseSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    status?: boolean
    title?: boolean
    slug?: boolean
    description?: boolean
    shortDescription?: boolean
    thumbnail?: boolean
    price?: boolean
    discountPrice?: boolean
    difficulty?: boolean
    createdAt?: boolean
    updateAt?: boolean
  }, ExtArgs["result"]["course"]>

  export type CourseSelectScalar = {
    id?: boolean
    status?: boolean
    title?: boolean
    slug?: boolean
    description?: boolean
    shortDescription?: boolean
    thumbnail?: boolean
    price?: boolean
    discountPrice?: boolean
    difficulty?: boolean
    createdAt?: boolean
    updateAt?: boolean
  }

  export type CourseOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "status" | "title" | "slug" | "description" | "shortDescription" | "thumbnail" | "price" | "discountPrice" | "difficulty" | "createdAt" | "updateAt", ExtArgs["result"]["course"]>
  export type CourseInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    tags?: boolean | Course$tagsArgs<ExtArgs>
    modules?: boolean | Course$modulesArgs<ExtArgs>
    _count?: boolean | CourseCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type CourseIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}
  export type CourseIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $CoursePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Course"
    objects: {
      tags: Prisma.$CourseTagPayload<ExtArgs>[]
      modules: Prisma.$CourseModulePayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      status: $Enums.CourseStatus
      title: string
      slug: string
      description: string
      shortDescription: string | null
      thumbnail: string
      price: number
      discountPrice: number | null
      difficulty: $Enums.CourseDifficulty
      createdAt: Date
      updateAt: Date
    }, ExtArgs["result"]["course"]>
    composites: {}
  }

  type CourseGetPayload<S extends boolean | null | undefined | CourseDefaultArgs> = $Result.GetResult<Prisma.$CoursePayload, S>

  type CourseCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<CourseFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: CourseCountAggregateInputType | true
    }

  export interface CourseDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Course'], meta: { name: 'Course' } }
    /**
     * Find zero or one Course that matches the filter.
     * @param {CourseFindUniqueArgs} args - Arguments to find a Course
     * @example
     * // Get one Course
     * const course = await prisma.course.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends CourseFindUniqueArgs>(args: SelectSubset<T, CourseFindUniqueArgs<ExtArgs>>): Prisma__CourseClient<$Result.GetResult<Prisma.$CoursePayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Course that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {CourseFindUniqueOrThrowArgs} args - Arguments to find a Course
     * @example
     * // Get one Course
     * const course = await prisma.course.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends CourseFindUniqueOrThrowArgs>(args: SelectSubset<T, CourseFindUniqueOrThrowArgs<ExtArgs>>): Prisma__CourseClient<$Result.GetResult<Prisma.$CoursePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Course that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CourseFindFirstArgs} args - Arguments to find a Course
     * @example
     * // Get one Course
     * const course = await prisma.course.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends CourseFindFirstArgs>(args?: SelectSubset<T, CourseFindFirstArgs<ExtArgs>>): Prisma__CourseClient<$Result.GetResult<Prisma.$CoursePayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Course that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CourseFindFirstOrThrowArgs} args - Arguments to find a Course
     * @example
     * // Get one Course
     * const course = await prisma.course.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends CourseFindFirstOrThrowArgs>(args?: SelectSubset<T, CourseFindFirstOrThrowArgs<ExtArgs>>): Prisma__CourseClient<$Result.GetResult<Prisma.$CoursePayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Courses that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CourseFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Courses
     * const courses = await prisma.course.findMany()
     * 
     * // Get first 10 Courses
     * const courses = await prisma.course.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const courseWithIdOnly = await prisma.course.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends CourseFindManyArgs>(args?: SelectSubset<T, CourseFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CoursePayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Course.
     * @param {CourseCreateArgs} args - Arguments to create a Course.
     * @example
     * // Create one Course
     * const Course = await prisma.course.create({
     *   data: {
     *     // ... data to create a Course
     *   }
     * })
     * 
     */
    create<T extends CourseCreateArgs>(args: SelectSubset<T, CourseCreateArgs<ExtArgs>>): Prisma__CourseClient<$Result.GetResult<Prisma.$CoursePayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Courses.
     * @param {CourseCreateManyArgs} args - Arguments to create many Courses.
     * @example
     * // Create many Courses
     * const course = await prisma.course.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends CourseCreateManyArgs>(args?: SelectSubset<T, CourseCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Courses and returns the data saved in the database.
     * @param {CourseCreateManyAndReturnArgs} args - Arguments to create many Courses.
     * @example
     * // Create many Courses
     * const course = await prisma.course.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Courses and only return the `id`
     * const courseWithIdOnly = await prisma.course.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends CourseCreateManyAndReturnArgs>(args?: SelectSubset<T, CourseCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CoursePayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Course.
     * @param {CourseDeleteArgs} args - Arguments to delete one Course.
     * @example
     * // Delete one Course
     * const Course = await prisma.course.delete({
     *   where: {
     *     // ... filter to delete one Course
     *   }
     * })
     * 
     */
    delete<T extends CourseDeleteArgs>(args: SelectSubset<T, CourseDeleteArgs<ExtArgs>>): Prisma__CourseClient<$Result.GetResult<Prisma.$CoursePayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Course.
     * @param {CourseUpdateArgs} args - Arguments to update one Course.
     * @example
     * // Update one Course
     * const course = await prisma.course.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends CourseUpdateArgs>(args: SelectSubset<T, CourseUpdateArgs<ExtArgs>>): Prisma__CourseClient<$Result.GetResult<Prisma.$CoursePayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Courses.
     * @param {CourseDeleteManyArgs} args - Arguments to filter Courses to delete.
     * @example
     * // Delete a few Courses
     * const { count } = await prisma.course.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends CourseDeleteManyArgs>(args?: SelectSubset<T, CourseDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Courses.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CourseUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Courses
     * const course = await prisma.course.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends CourseUpdateManyArgs>(args: SelectSubset<T, CourseUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Courses and returns the data updated in the database.
     * @param {CourseUpdateManyAndReturnArgs} args - Arguments to update many Courses.
     * @example
     * // Update many Courses
     * const course = await prisma.course.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Courses and only return the `id`
     * const courseWithIdOnly = await prisma.course.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends CourseUpdateManyAndReturnArgs>(args: SelectSubset<T, CourseUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CoursePayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Course.
     * @param {CourseUpsertArgs} args - Arguments to update or create a Course.
     * @example
     * // Update or create a Course
     * const course = await prisma.course.upsert({
     *   create: {
     *     // ... data to create a Course
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Course we want to update
     *   }
     * })
     */
    upsert<T extends CourseUpsertArgs>(args: SelectSubset<T, CourseUpsertArgs<ExtArgs>>): Prisma__CourseClient<$Result.GetResult<Prisma.$CoursePayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Courses.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CourseCountArgs} args - Arguments to filter Courses to count.
     * @example
     * // Count the number of Courses
     * const count = await prisma.course.count({
     *   where: {
     *     // ... the filter for the Courses we want to count
     *   }
     * })
    **/
    count<T extends CourseCountArgs>(
      args?: Subset<T, CourseCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], CourseCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Course.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CourseAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends CourseAggregateArgs>(args: Subset<T, CourseAggregateArgs>): Prisma.PrismaPromise<GetCourseAggregateType<T>>

    /**
     * Group by Course.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CourseGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends CourseGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: CourseGroupByArgs['orderBy'] }
        : { orderBy?: CourseGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, CourseGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetCourseGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Course model
   */
  readonly fields: CourseFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Course.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__CourseClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    tags<T extends Course$tagsArgs<ExtArgs> = {}>(args?: Subset<T, Course$tagsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CourseTagPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    modules<T extends Course$modulesArgs<ExtArgs> = {}>(args?: Subset<T, Course$modulesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CourseModulePayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Course model
   */
  interface CourseFieldRefs {
    readonly id: FieldRef<"Course", 'String'>
    readonly status: FieldRef<"Course", 'CourseStatus'>
    readonly title: FieldRef<"Course", 'String'>
    readonly slug: FieldRef<"Course", 'String'>
    readonly description: FieldRef<"Course", 'String'>
    readonly shortDescription: FieldRef<"Course", 'String'>
    readonly thumbnail: FieldRef<"Course", 'String'>
    readonly price: FieldRef<"Course", 'Float'>
    readonly discountPrice: FieldRef<"Course", 'Float'>
    readonly difficulty: FieldRef<"Course", 'CourseDifficulty'>
    readonly createdAt: FieldRef<"Course", 'DateTime'>
    readonly updateAt: FieldRef<"Course", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Course findUnique
   */
  export type CourseFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Course
     */
    select?: CourseSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Course
     */
    omit?: CourseOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CourseInclude<ExtArgs> | null
    /**
     * Filter, which Course to fetch.
     */
    where: CourseWhereUniqueInput
  }

  /**
   * Course findUniqueOrThrow
   */
  export type CourseFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Course
     */
    select?: CourseSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Course
     */
    omit?: CourseOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CourseInclude<ExtArgs> | null
    /**
     * Filter, which Course to fetch.
     */
    where: CourseWhereUniqueInput
  }

  /**
   * Course findFirst
   */
  export type CourseFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Course
     */
    select?: CourseSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Course
     */
    omit?: CourseOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CourseInclude<ExtArgs> | null
    /**
     * Filter, which Course to fetch.
     */
    where?: CourseWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Courses to fetch.
     */
    orderBy?: CourseOrderByWithRelationInput | CourseOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Courses.
     */
    cursor?: CourseWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Courses from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Courses.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Courses.
     */
    distinct?: CourseScalarFieldEnum | CourseScalarFieldEnum[]
  }

  /**
   * Course findFirstOrThrow
   */
  export type CourseFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Course
     */
    select?: CourseSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Course
     */
    omit?: CourseOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CourseInclude<ExtArgs> | null
    /**
     * Filter, which Course to fetch.
     */
    where?: CourseWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Courses to fetch.
     */
    orderBy?: CourseOrderByWithRelationInput | CourseOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Courses.
     */
    cursor?: CourseWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Courses from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Courses.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Courses.
     */
    distinct?: CourseScalarFieldEnum | CourseScalarFieldEnum[]
  }

  /**
   * Course findMany
   */
  export type CourseFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Course
     */
    select?: CourseSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Course
     */
    omit?: CourseOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CourseInclude<ExtArgs> | null
    /**
     * Filter, which Courses to fetch.
     */
    where?: CourseWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Courses to fetch.
     */
    orderBy?: CourseOrderByWithRelationInput | CourseOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Courses.
     */
    cursor?: CourseWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Courses from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Courses.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Courses.
     */
    distinct?: CourseScalarFieldEnum | CourseScalarFieldEnum[]
  }

  /**
   * Course create
   */
  export type CourseCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Course
     */
    select?: CourseSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Course
     */
    omit?: CourseOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CourseInclude<ExtArgs> | null
    /**
     * The data needed to create a Course.
     */
    data: XOR<CourseCreateInput, CourseUncheckedCreateInput>
  }

  /**
   * Course createMany
   */
  export type CourseCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Courses.
     */
    data: CourseCreateManyInput | CourseCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Course createManyAndReturn
   */
  export type CourseCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Course
     */
    select?: CourseSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Course
     */
    omit?: CourseOmit<ExtArgs> | null
    /**
     * The data used to create many Courses.
     */
    data: CourseCreateManyInput | CourseCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Course update
   */
  export type CourseUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Course
     */
    select?: CourseSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Course
     */
    omit?: CourseOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CourseInclude<ExtArgs> | null
    /**
     * The data needed to update a Course.
     */
    data: XOR<CourseUpdateInput, CourseUncheckedUpdateInput>
    /**
     * Choose, which Course to update.
     */
    where: CourseWhereUniqueInput
  }

  /**
   * Course updateMany
   */
  export type CourseUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Courses.
     */
    data: XOR<CourseUpdateManyMutationInput, CourseUncheckedUpdateManyInput>
    /**
     * Filter which Courses to update
     */
    where?: CourseWhereInput
    /**
     * Limit how many Courses to update.
     */
    limit?: number
  }

  /**
   * Course updateManyAndReturn
   */
  export type CourseUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Course
     */
    select?: CourseSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Course
     */
    omit?: CourseOmit<ExtArgs> | null
    /**
     * The data used to update Courses.
     */
    data: XOR<CourseUpdateManyMutationInput, CourseUncheckedUpdateManyInput>
    /**
     * Filter which Courses to update
     */
    where?: CourseWhereInput
    /**
     * Limit how many Courses to update.
     */
    limit?: number
  }

  /**
   * Course upsert
   */
  export type CourseUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Course
     */
    select?: CourseSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Course
     */
    omit?: CourseOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CourseInclude<ExtArgs> | null
    /**
     * The filter to search for the Course to update in case it exists.
     */
    where: CourseWhereUniqueInput
    /**
     * In case the Course found by the `where` argument doesn't exist, create a new Course with this data.
     */
    create: XOR<CourseCreateInput, CourseUncheckedCreateInput>
    /**
     * In case the Course was found with the provided `where` argument, update it with this data.
     */
    update: XOR<CourseUpdateInput, CourseUncheckedUpdateInput>
  }

  /**
   * Course delete
   */
  export type CourseDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Course
     */
    select?: CourseSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Course
     */
    omit?: CourseOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CourseInclude<ExtArgs> | null
    /**
     * Filter which Course to delete.
     */
    where: CourseWhereUniqueInput
  }

  /**
   * Course deleteMany
   */
  export type CourseDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Courses to delete
     */
    where?: CourseWhereInput
    /**
     * Limit how many Courses to delete.
     */
    limit?: number
  }

  /**
   * Course.tags
   */
  export type Course$tagsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CourseTag
     */
    select?: CourseTagSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CourseTag
     */
    omit?: CourseTagOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CourseTagInclude<ExtArgs> | null
    where?: CourseTagWhereInput
    orderBy?: CourseTagOrderByWithRelationInput | CourseTagOrderByWithRelationInput[]
    cursor?: CourseTagWhereUniqueInput
    take?: number
    skip?: number
    distinct?: CourseTagScalarFieldEnum | CourseTagScalarFieldEnum[]
  }

  /**
   * Course.modules
   */
  export type Course$modulesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CourseModule
     */
    select?: CourseModuleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CourseModule
     */
    omit?: CourseModuleOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CourseModuleInclude<ExtArgs> | null
    where?: CourseModuleWhereInput
    orderBy?: CourseModuleOrderByWithRelationInput | CourseModuleOrderByWithRelationInput[]
    cursor?: CourseModuleWhereUniqueInput
    take?: number
    skip?: number
    distinct?: CourseModuleScalarFieldEnum | CourseModuleScalarFieldEnum[]
  }

  /**
   * Course without action
   */
  export type CourseDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Course
     */
    select?: CourseSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Course
     */
    omit?: CourseOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CourseInclude<ExtArgs> | null
  }


  /**
   * Model CourseModule
   */

  export type AggregateCourseModule = {
    _count: CourseModuleCountAggregateOutputType | null
    _avg: CourseModuleAvgAggregateOutputType | null
    _sum: CourseModuleSumAggregateOutputType | null
    _min: CourseModuleMinAggregateOutputType | null
    _max: CourseModuleMaxAggregateOutputType | null
  }

  export type CourseModuleAvgAggregateOutputType = {
    order: number | null
  }

  export type CourseModuleSumAggregateOutputType = {
    order: number | null
  }

  export type CourseModuleMinAggregateOutputType = {
    id: string | null
    title: string | null
    description: string | null
    courseId: string | null
    order: number | null
    createdAt: Date | null
    updateAt: Date | null
  }

  export type CourseModuleMaxAggregateOutputType = {
    id: string | null
    title: string | null
    description: string | null
    courseId: string | null
    order: number | null
    createdAt: Date | null
    updateAt: Date | null
  }

  export type CourseModuleCountAggregateOutputType = {
    id: number
    title: number
    description: number
    courseId: number
    order: number
    createdAt: number
    updateAt: number
    _all: number
  }


  export type CourseModuleAvgAggregateInputType = {
    order?: true
  }

  export type CourseModuleSumAggregateInputType = {
    order?: true
  }

  export type CourseModuleMinAggregateInputType = {
    id?: true
    title?: true
    description?: true
    courseId?: true
    order?: true
    createdAt?: true
    updateAt?: true
  }

  export type CourseModuleMaxAggregateInputType = {
    id?: true
    title?: true
    description?: true
    courseId?: true
    order?: true
    createdAt?: true
    updateAt?: true
  }

  export type CourseModuleCountAggregateInputType = {
    id?: true
    title?: true
    description?: true
    courseId?: true
    order?: true
    createdAt?: true
    updateAt?: true
    _all?: true
  }

  export type CourseModuleAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which CourseModule to aggregate.
     */
    where?: CourseModuleWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CourseModules to fetch.
     */
    orderBy?: CourseModuleOrderByWithRelationInput | CourseModuleOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: CourseModuleWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CourseModules from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CourseModules.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned CourseModules
    **/
    _count?: true | CourseModuleCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: CourseModuleAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: CourseModuleSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: CourseModuleMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: CourseModuleMaxAggregateInputType
  }

  export type GetCourseModuleAggregateType<T extends CourseModuleAggregateArgs> = {
        [P in keyof T & keyof AggregateCourseModule]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateCourseModule[P]>
      : GetScalarType<T[P], AggregateCourseModule[P]>
  }




  export type CourseModuleGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: CourseModuleWhereInput
    orderBy?: CourseModuleOrderByWithAggregationInput | CourseModuleOrderByWithAggregationInput[]
    by: CourseModuleScalarFieldEnum[] | CourseModuleScalarFieldEnum
    having?: CourseModuleScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: CourseModuleCountAggregateInputType | true
    _avg?: CourseModuleAvgAggregateInputType
    _sum?: CourseModuleSumAggregateInputType
    _min?: CourseModuleMinAggregateInputType
    _max?: CourseModuleMaxAggregateInputType
  }

  export type CourseModuleGroupByOutputType = {
    id: string
    title: string
    description: string
    courseId: string
    order: number
    createdAt: Date
    updateAt: Date
    _count: CourseModuleCountAggregateOutputType | null
    _avg: CourseModuleAvgAggregateOutputType | null
    _sum: CourseModuleSumAggregateOutputType | null
    _min: CourseModuleMinAggregateOutputType | null
    _max: CourseModuleMaxAggregateOutputType | null
  }

  type GetCourseModuleGroupByPayload<T extends CourseModuleGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<CourseModuleGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof CourseModuleGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], CourseModuleGroupByOutputType[P]>
            : GetScalarType<T[P], CourseModuleGroupByOutputType[P]>
        }
      >
    >


  export type CourseModuleSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    title?: boolean
    description?: boolean
    courseId?: boolean
    order?: boolean
    createdAt?: boolean
    updateAt?: boolean
    course?: boolean | CourseDefaultArgs<ExtArgs>
    lessons?: boolean | CourseModule$lessonsArgs<ExtArgs>
    _count?: boolean | CourseModuleCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["courseModule"]>

  export type CourseModuleSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    title?: boolean
    description?: boolean
    courseId?: boolean
    order?: boolean
    createdAt?: boolean
    updateAt?: boolean
    course?: boolean | CourseDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["courseModule"]>

  export type CourseModuleSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    title?: boolean
    description?: boolean
    courseId?: boolean
    order?: boolean
    createdAt?: boolean
    updateAt?: boolean
    course?: boolean | CourseDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["courseModule"]>

  export type CourseModuleSelectScalar = {
    id?: boolean
    title?: boolean
    description?: boolean
    courseId?: boolean
    order?: boolean
    createdAt?: boolean
    updateAt?: boolean
  }

  export type CourseModuleOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "title" | "description" | "courseId" | "order" | "createdAt" | "updateAt", ExtArgs["result"]["courseModule"]>
  export type CourseModuleInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    course?: boolean | CourseDefaultArgs<ExtArgs>
    lessons?: boolean | CourseModule$lessonsArgs<ExtArgs>
    _count?: boolean | CourseModuleCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type CourseModuleIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    course?: boolean | CourseDefaultArgs<ExtArgs>
  }
  export type CourseModuleIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    course?: boolean | CourseDefaultArgs<ExtArgs>
  }

  export type $CourseModulePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "CourseModule"
    objects: {
      course: Prisma.$CoursePayload<ExtArgs>
      lessons: Prisma.$CourseLessonPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      title: string
      description: string
      courseId: string
      order: number
      createdAt: Date
      updateAt: Date
    }, ExtArgs["result"]["courseModule"]>
    composites: {}
  }

  type CourseModuleGetPayload<S extends boolean | null | undefined | CourseModuleDefaultArgs> = $Result.GetResult<Prisma.$CourseModulePayload, S>

  type CourseModuleCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<CourseModuleFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: CourseModuleCountAggregateInputType | true
    }

  export interface CourseModuleDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['CourseModule'], meta: { name: 'CourseModule' } }
    /**
     * Find zero or one CourseModule that matches the filter.
     * @param {CourseModuleFindUniqueArgs} args - Arguments to find a CourseModule
     * @example
     * // Get one CourseModule
     * const courseModule = await prisma.courseModule.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends CourseModuleFindUniqueArgs>(args: SelectSubset<T, CourseModuleFindUniqueArgs<ExtArgs>>): Prisma__CourseModuleClient<$Result.GetResult<Prisma.$CourseModulePayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one CourseModule that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {CourseModuleFindUniqueOrThrowArgs} args - Arguments to find a CourseModule
     * @example
     * // Get one CourseModule
     * const courseModule = await prisma.courseModule.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends CourseModuleFindUniqueOrThrowArgs>(args: SelectSubset<T, CourseModuleFindUniqueOrThrowArgs<ExtArgs>>): Prisma__CourseModuleClient<$Result.GetResult<Prisma.$CourseModulePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first CourseModule that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CourseModuleFindFirstArgs} args - Arguments to find a CourseModule
     * @example
     * // Get one CourseModule
     * const courseModule = await prisma.courseModule.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends CourseModuleFindFirstArgs>(args?: SelectSubset<T, CourseModuleFindFirstArgs<ExtArgs>>): Prisma__CourseModuleClient<$Result.GetResult<Prisma.$CourseModulePayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first CourseModule that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CourseModuleFindFirstOrThrowArgs} args - Arguments to find a CourseModule
     * @example
     * // Get one CourseModule
     * const courseModule = await prisma.courseModule.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends CourseModuleFindFirstOrThrowArgs>(args?: SelectSubset<T, CourseModuleFindFirstOrThrowArgs<ExtArgs>>): Prisma__CourseModuleClient<$Result.GetResult<Prisma.$CourseModulePayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more CourseModules that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CourseModuleFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all CourseModules
     * const courseModules = await prisma.courseModule.findMany()
     * 
     * // Get first 10 CourseModules
     * const courseModules = await prisma.courseModule.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const courseModuleWithIdOnly = await prisma.courseModule.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends CourseModuleFindManyArgs>(args?: SelectSubset<T, CourseModuleFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CourseModulePayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a CourseModule.
     * @param {CourseModuleCreateArgs} args - Arguments to create a CourseModule.
     * @example
     * // Create one CourseModule
     * const CourseModule = await prisma.courseModule.create({
     *   data: {
     *     // ... data to create a CourseModule
     *   }
     * })
     * 
     */
    create<T extends CourseModuleCreateArgs>(args: SelectSubset<T, CourseModuleCreateArgs<ExtArgs>>): Prisma__CourseModuleClient<$Result.GetResult<Prisma.$CourseModulePayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many CourseModules.
     * @param {CourseModuleCreateManyArgs} args - Arguments to create many CourseModules.
     * @example
     * // Create many CourseModules
     * const courseModule = await prisma.courseModule.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends CourseModuleCreateManyArgs>(args?: SelectSubset<T, CourseModuleCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many CourseModules and returns the data saved in the database.
     * @param {CourseModuleCreateManyAndReturnArgs} args - Arguments to create many CourseModules.
     * @example
     * // Create many CourseModules
     * const courseModule = await prisma.courseModule.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many CourseModules and only return the `id`
     * const courseModuleWithIdOnly = await prisma.courseModule.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends CourseModuleCreateManyAndReturnArgs>(args?: SelectSubset<T, CourseModuleCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CourseModulePayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a CourseModule.
     * @param {CourseModuleDeleteArgs} args - Arguments to delete one CourseModule.
     * @example
     * // Delete one CourseModule
     * const CourseModule = await prisma.courseModule.delete({
     *   where: {
     *     // ... filter to delete one CourseModule
     *   }
     * })
     * 
     */
    delete<T extends CourseModuleDeleteArgs>(args: SelectSubset<T, CourseModuleDeleteArgs<ExtArgs>>): Prisma__CourseModuleClient<$Result.GetResult<Prisma.$CourseModulePayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one CourseModule.
     * @param {CourseModuleUpdateArgs} args - Arguments to update one CourseModule.
     * @example
     * // Update one CourseModule
     * const courseModule = await prisma.courseModule.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends CourseModuleUpdateArgs>(args: SelectSubset<T, CourseModuleUpdateArgs<ExtArgs>>): Prisma__CourseModuleClient<$Result.GetResult<Prisma.$CourseModulePayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more CourseModules.
     * @param {CourseModuleDeleteManyArgs} args - Arguments to filter CourseModules to delete.
     * @example
     * // Delete a few CourseModules
     * const { count } = await prisma.courseModule.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends CourseModuleDeleteManyArgs>(args?: SelectSubset<T, CourseModuleDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more CourseModules.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CourseModuleUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many CourseModules
     * const courseModule = await prisma.courseModule.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends CourseModuleUpdateManyArgs>(args: SelectSubset<T, CourseModuleUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more CourseModules and returns the data updated in the database.
     * @param {CourseModuleUpdateManyAndReturnArgs} args - Arguments to update many CourseModules.
     * @example
     * // Update many CourseModules
     * const courseModule = await prisma.courseModule.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more CourseModules and only return the `id`
     * const courseModuleWithIdOnly = await prisma.courseModule.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends CourseModuleUpdateManyAndReturnArgs>(args: SelectSubset<T, CourseModuleUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CourseModulePayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one CourseModule.
     * @param {CourseModuleUpsertArgs} args - Arguments to update or create a CourseModule.
     * @example
     * // Update or create a CourseModule
     * const courseModule = await prisma.courseModule.upsert({
     *   create: {
     *     // ... data to create a CourseModule
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the CourseModule we want to update
     *   }
     * })
     */
    upsert<T extends CourseModuleUpsertArgs>(args: SelectSubset<T, CourseModuleUpsertArgs<ExtArgs>>): Prisma__CourseModuleClient<$Result.GetResult<Prisma.$CourseModulePayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of CourseModules.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CourseModuleCountArgs} args - Arguments to filter CourseModules to count.
     * @example
     * // Count the number of CourseModules
     * const count = await prisma.courseModule.count({
     *   where: {
     *     // ... the filter for the CourseModules we want to count
     *   }
     * })
    **/
    count<T extends CourseModuleCountArgs>(
      args?: Subset<T, CourseModuleCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], CourseModuleCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a CourseModule.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CourseModuleAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends CourseModuleAggregateArgs>(args: Subset<T, CourseModuleAggregateArgs>): Prisma.PrismaPromise<GetCourseModuleAggregateType<T>>

    /**
     * Group by CourseModule.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CourseModuleGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends CourseModuleGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: CourseModuleGroupByArgs['orderBy'] }
        : { orderBy?: CourseModuleGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, CourseModuleGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetCourseModuleGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the CourseModule model
   */
  readonly fields: CourseModuleFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for CourseModule.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__CourseModuleClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    course<T extends CourseDefaultArgs<ExtArgs> = {}>(args?: Subset<T, CourseDefaultArgs<ExtArgs>>): Prisma__CourseClient<$Result.GetResult<Prisma.$CoursePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    lessons<T extends CourseModule$lessonsArgs<ExtArgs> = {}>(args?: Subset<T, CourseModule$lessonsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CourseLessonPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the CourseModule model
   */
  interface CourseModuleFieldRefs {
    readonly id: FieldRef<"CourseModule", 'String'>
    readonly title: FieldRef<"CourseModule", 'String'>
    readonly description: FieldRef<"CourseModule", 'String'>
    readonly courseId: FieldRef<"CourseModule", 'String'>
    readonly order: FieldRef<"CourseModule", 'Int'>
    readonly createdAt: FieldRef<"CourseModule", 'DateTime'>
    readonly updateAt: FieldRef<"CourseModule", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * CourseModule findUnique
   */
  export type CourseModuleFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CourseModule
     */
    select?: CourseModuleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CourseModule
     */
    omit?: CourseModuleOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CourseModuleInclude<ExtArgs> | null
    /**
     * Filter, which CourseModule to fetch.
     */
    where: CourseModuleWhereUniqueInput
  }

  /**
   * CourseModule findUniqueOrThrow
   */
  export type CourseModuleFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CourseModule
     */
    select?: CourseModuleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CourseModule
     */
    omit?: CourseModuleOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CourseModuleInclude<ExtArgs> | null
    /**
     * Filter, which CourseModule to fetch.
     */
    where: CourseModuleWhereUniqueInput
  }

  /**
   * CourseModule findFirst
   */
  export type CourseModuleFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CourseModule
     */
    select?: CourseModuleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CourseModule
     */
    omit?: CourseModuleOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CourseModuleInclude<ExtArgs> | null
    /**
     * Filter, which CourseModule to fetch.
     */
    where?: CourseModuleWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CourseModules to fetch.
     */
    orderBy?: CourseModuleOrderByWithRelationInput | CourseModuleOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for CourseModules.
     */
    cursor?: CourseModuleWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CourseModules from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CourseModules.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of CourseModules.
     */
    distinct?: CourseModuleScalarFieldEnum | CourseModuleScalarFieldEnum[]
  }

  /**
   * CourseModule findFirstOrThrow
   */
  export type CourseModuleFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CourseModule
     */
    select?: CourseModuleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CourseModule
     */
    omit?: CourseModuleOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CourseModuleInclude<ExtArgs> | null
    /**
     * Filter, which CourseModule to fetch.
     */
    where?: CourseModuleWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CourseModules to fetch.
     */
    orderBy?: CourseModuleOrderByWithRelationInput | CourseModuleOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for CourseModules.
     */
    cursor?: CourseModuleWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CourseModules from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CourseModules.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of CourseModules.
     */
    distinct?: CourseModuleScalarFieldEnum | CourseModuleScalarFieldEnum[]
  }

  /**
   * CourseModule findMany
   */
  export type CourseModuleFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CourseModule
     */
    select?: CourseModuleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CourseModule
     */
    omit?: CourseModuleOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CourseModuleInclude<ExtArgs> | null
    /**
     * Filter, which CourseModules to fetch.
     */
    where?: CourseModuleWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CourseModules to fetch.
     */
    orderBy?: CourseModuleOrderByWithRelationInput | CourseModuleOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing CourseModules.
     */
    cursor?: CourseModuleWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CourseModules from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CourseModules.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of CourseModules.
     */
    distinct?: CourseModuleScalarFieldEnum | CourseModuleScalarFieldEnum[]
  }

  /**
   * CourseModule create
   */
  export type CourseModuleCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CourseModule
     */
    select?: CourseModuleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CourseModule
     */
    omit?: CourseModuleOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CourseModuleInclude<ExtArgs> | null
    /**
     * The data needed to create a CourseModule.
     */
    data: XOR<CourseModuleCreateInput, CourseModuleUncheckedCreateInput>
  }

  /**
   * CourseModule createMany
   */
  export type CourseModuleCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many CourseModules.
     */
    data: CourseModuleCreateManyInput | CourseModuleCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * CourseModule createManyAndReturn
   */
  export type CourseModuleCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CourseModule
     */
    select?: CourseModuleSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the CourseModule
     */
    omit?: CourseModuleOmit<ExtArgs> | null
    /**
     * The data used to create many CourseModules.
     */
    data: CourseModuleCreateManyInput | CourseModuleCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CourseModuleIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * CourseModule update
   */
  export type CourseModuleUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CourseModule
     */
    select?: CourseModuleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CourseModule
     */
    omit?: CourseModuleOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CourseModuleInclude<ExtArgs> | null
    /**
     * The data needed to update a CourseModule.
     */
    data: XOR<CourseModuleUpdateInput, CourseModuleUncheckedUpdateInput>
    /**
     * Choose, which CourseModule to update.
     */
    where: CourseModuleWhereUniqueInput
  }

  /**
   * CourseModule updateMany
   */
  export type CourseModuleUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update CourseModules.
     */
    data: XOR<CourseModuleUpdateManyMutationInput, CourseModuleUncheckedUpdateManyInput>
    /**
     * Filter which CourseModules to update
     */
    where?: CourseModuleWhereInput
    /**
     * Limit how many CourseModules to update.
     */
    limit?: number
  }

  /**
   * CourseModule updateManyAndReturn
   */
  export type CourseModuleUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CourseModule
     */
    select?: CourseModuleSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the CourseModule
     */
    omit?: CourseModuleOmit<ExtArgs> | null
    /**
     * The data used to update CourseModules.
     */
    data: XOR<CourseModuleUpdateManyMutationInput, CourseModuleUncheckedUpdateManyInput>
    /**
     * Filter which CourseModules to update
     */
    where?: CourseModuleWhereInput
    /**
     * Limit how many CourseModules to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CourseModuleIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * CourseModule upsert
   */
  export type CourseModuleUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CourseModule
     */
    select?: CourseModuleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CourseModule
     */
    omit?: CourseModuleOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CourseModuleInclude<ExtArgs> | null
    /**
     * The filter to search for the CourseModule to update in case it exists.
     */
    where: CourseModuleWhereUniqueInput
    /**
     * In case the CourseModule found by the `where` argument doesn't exist, create a new CourseModule with this data.
     */
    create: XOR<CourseModuleCreateInput, CourseModuleUncheckedCreateInput>
    /**
     * In case the CourseModule was found with the provided `where` argument, update it with this data.
     */
    update: XOR<CourseModuleUpdateInput, CourseModuleUncheckedUpdateInput>
  }

  /**
   * CourseModule delete
   */
  export type CourseModuleDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CourseModule
     */
    select?: CourseModuleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CourseModule
     */
    omit?: CourseModuleOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CourseModuleInclude<ExtArgs> | null
    /**
     * Filter which CourseModule to delete.
     */
    where: CourseModuleWhereUniqueInput
  }

  /**
   * CourseModule deleteMany
   */
  export type CourseModuleDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which CourseModules to delete
     */
    where?: CourseModuleWhereInput
    /**
     * Limit how many CourseModules to delete.
     */
    limit?: number
  }

  /**
   * CourseModule.lessons
   */
  export type CourseModule$lessonsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CourseLesson
     */
    select?: CourseLessonSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CourseLesson
     */
    omit?: CourseLessonOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CourseLessonInclude<ExtArgs> | null
    where?: CourseLessonWhereInput
    orderBy?: CourseLessonOrderByWithRelationInput | CourseLessonOrderByWithRelationInput[]
    cursor?: CourseLessonWhereUniqueInput
    take?: number
    skip?: number
    distinct?: CourseLessonScalarFieldEnum | CourseLessonScalarFieldEnum[]
  }

  /**
   * CourseModule without action
   */
  export type CourseModuleDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CourseModule
     */
    select?: CourseModuleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CourseModule
     */
    omit?: CourseModuleOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CourseModuleInclude<ExtArgs> | null
  }


  /**
   * Model CourseLesson
   */

  export type AggregateCourseLesson = {
    _count: CourseLessonCountAggregateOutputType | null
    _avg: CourseLessonAvgAggregateOutputType | null
    _sum: CourseLessonSumAggregateOutputType | null
    _min: CourseLessonMinAggregateOutputType | null
    _max: CourseLessonMaxAggregateOutputType | null
  }

  export type CourseLessonAvgAggregateOutputType = {
    durationInMs: number | null
    order: number | null
  }

  export type CourseLessonSumAggregateOutputType = {
    durationInMs: number | null
    order: number | null
  }

  export type CourseLessonMinAggregateOutputType = {
    id: string | null
    title: string | null
    description: string | null
    videoId: string | null
    durationInMs: number | null
    order: number | null
    moduleId: string | null
    createdAt: Date | null
    updateAt: Date | null
  }

  export type CourseLessonMaxAggregateOutputType = {
    id: string | null
    title: string | null
    description: string | null
    videoId: string | null
    durationInMs: number | null
    order: number | null
    moduleId: string | null
    createdAt: Date | null
    updateAt: Date | null
  }

  export type CourseLessonCountAggregateOutputType = {
    id: number
    title: number
    description: number
    videoId: number
    durationInMs: number
    order: number
    moduleId: number
    createdAt: number
    updateAt: number
    _all: number
  }


  export type CourseLessonAvgAggregateInputType = {
    durationInMs?: true
    order?: true
  }

  export type CourseLessonSumAggregateInputType = {
    durationInMs?: true
    order?: true
  }

  export type CourseLessonMinAggregateInputType = {
    id?: true
    title?: true
    description?: true
    videoId?: true
    durationInMs?: true
    order?: true
    moduleId?: true
    createdAt?: true
    updateAt?: true
  }

  export type CourseLessonMaxAggregateInputType = {
    id?: true
    title?: true
    description?: true
    videoId?: true
    durationInMs?: true
    order?: true
    moduleId?: true
    createdAt?: true
    updateAt?: true
  }

  export type CourseLessonCountAggregateInputType = {
    id?: true
    title?: true
    description?: true
    videoId?: true
    durationInMs?: true
    order?: true
    moduleId?: true
    createdAt?: true
    updateAt?: true
    _all?: true
  }

  export type CourseLessonAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which CourseLesson to aggregate.
     */
    where?: CourseLessonWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CourseLessons to fetch.
     */
    orderBy?: CourseLessonOrderByWithRelationInput | CourseLessonOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: CourseLessonWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CourseLessons from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CourseLessons.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned CourseLessons
    **/
    _count?: true | CourseLessonCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: CourseLessonAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: CourseLessonSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: CourseLessonMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: CourseLessonMaxAggregateInputType
  }

  export type GetCourseLessonAggregateType<T extends CourseLessonAggregateArgs> = {
        [P in keyof T & keyof AggregateCourseLesson]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateCourseLesson[P]>
      : GetScalarType<T[P], AggregateCourseLesson[P]>
  }




  export type CourseLessonGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: CourseLessonWhereInput
    orderBy?: CourseLessonOrderByWithAggregationInput | CourseLessonOrderByWithAggregationInput[]
    by: CourseLessonScalarFieldEnum[] | CourseLessonScalarFieldEnum
    having?: CourseLessonScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: CourseLessonCountAggregateInputType | true
    _avg?: CourseLessonAvgAggregateInputType
    _sum?: CourseLessonSumAggregateInputType
    _min?: CourseLessonMinAggregateInputType
    _max?: CourseLessonMaxAggregateInputType
  }

  export type CourseLessonGroupByOutputType = {
    id: string
    title: string
    description: string
    videoId: string
    durationInMs: number
    order: number
    moduleId: string
    createdAt: Date
    updateAt: Date
    _count: CourseLessonCountAggregateOutputType | null
    _avg: CourseLessonAvgAggregateOutputType | null
    _sum: CourseLessonSumAggregateOutputType | null
    _min: CourseLessonMinAggregateOutputType | null
    _max: CourseLessonMaxAggregateOutputType | null
  }

  type GetCourseLessonGroupByPayload<T extends CourseLessonGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<CourseLessonGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof CourseLessonGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], CourseLessonGroupByOutputType[P]>
            : GetScalarType<T[P], CourseLessonGroupByOutputType[P]>
        }
      >
    >


  export type CourseLessonSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    title?: boolean
    description?: boolean
    videoId?: boolean
    durationInMs?: boolean
    order?: boolean
    moduleId?: boolean
    createdAt?: boolean
    updateAt?: boolean
    module?: boolean | CourseModuleDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["courseLesson"]>

  export type CourseLessonSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    title?: boolean
    description?: boolean
    videoId?: boolean
    durationInMs?: boolean
    order?: boolean
    moduleId?: boolean
    createdAt?: boolean
    updateAt?: boolean
    module?: boolean | CourseModuleDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["courseLesson"]>

  export type CourseLessonSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    title?: boolean
    description?: boolean
    videoId?: boolean
    durationInMs?: boolean
    order?: boolean
    moduleId?: boolean
    createdAt?: boolean
    updateAt?: boolean
    module?: boolean | CourseModuleDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["courseLesson"]>

  export type CourseLessonSelectScalar = {
    id?: boolean
    title?: boolean
    description?: boolean
    videoId?: boolean
    durationInMs?: boolean
    order?: boolean
    moduleId?: boolean
    createdAt?: boolean
    updateAt?: boolean
  }

  export type CourseLessonOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "title" | "description" | "videoId" | "durationInMs" | "order" | "moduleId" | "createdAt" | "updateAt", ExtArgs["result"]["courseLesson"]>
  export type CourseLessonInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    module?: boolean | CourseModuleDefaultArgs<ExtArgs>
  }
  export type CourseLessonIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    module?: boolean | CourseModuleDefaultArgs<ExtArgs>
  }
  export type CourseLessonIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    module?: boolean | CourseModuleDefaultArgs<ExtArgs>
  }

  export type $CourseLessonPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "CourseLesson"
    objects: {
      module: Prisma.$CourseModulePayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      title: string
      description: string
      videoId: string
      durationInMs: number
      order: number
      moduleId: string
      createdAt: Date
      updateAt: Date
    }, ExtArgs["result"]["courseLesson"]>
    composites: {}
  }

  type CourseLessonGetPayload<S extends boolean | null | undefined | CourseLessonDefaultArgs> = $Result.GetResult<Prisma.$CourseLessonPayload, S>

  type CourseLessonCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<CourseLessonFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: CourseLessonCountAggregateInputType | true
    }

  export interface CourseLessonDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['CourseLesson'], meta: { name: 'CourseLesson' } }
    /**
     * Find zero or one CourseLesson that matches the filter.
     * @param {CourseLessonFindUniqueArgs} args - Arguments to find a CourseLesson
     * @example
     * // Get one CourseLesson
     * const courseLesson = await prisma.courseLesson.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends CourseLessonFindUniqueArgs>(args: SelectSubset<T, CourseLessonFindUniqueArgs<ExtArgs>>): Prisma__CourseLessonClient<$Result.GetResult<Prisma.$CourseLessonPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one CourseLesson that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {CourseLessonFindUniqueOrThrowArgs} args - Arguments to find a CourseLesson
     * @example
     * // Get one CourseLesson
     * const courseLesson = await prisma.courseLesson.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends CourseLessonFindUniqueOrThrowArgs>(args: SelectSubset<T, CourseLessonFindUniqueOrThrowArgs<ExtArgs>>): Prisma__CourseLessonClient<$Result.GetResult<Prisma.$CourseLessonPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first CourseLesson that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CourseLessonFindFirstArgs} args - Arguments to find a CourseLesson
     * @example
     * // Get one CourseLesson
     * const courseLesson = await prisma.courseLesson.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends CourseLessonFindFirstArgs>(args?: SelectSubset<T, CourseLessonFindFirstArgs<ExtArgs>>): Prisma__CourseLessonClient<$Result.GetResult<Prisma.$CourseLessonPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first CourseLesson that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CourseLessonFindFirstOrThrowArgs} args - Arguments to find a CourseLesson
     * @example
     * // Get one CourseLesson
     * const courseLesson = await prisma.courseLesson.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends CourseLessonFindFirstOrThrowArgs>(args?: SelectSubset<T, CourseLessonFindFirstOrThrowArgs<ExtArgs>>): Prisma__CourseLessonClient<$Result.GetResult<Prisma.$CourseLessonPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more CourseLessons that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CourseLessonFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all CourseLessons
     * const courseLessons = await prisma.courseLesson.findMany()
     * 
     * // Get first 10 CourseLessons
     * const courseLessons = await prisma.courseLesson.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const courseLessonWithIdOnly = await prisma.courseLesson.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends CourseLessonFindManyArgs>(args?: SelectSubset<T, CourseLessonFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CourseLessonPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a CourseLesson.
     * @param {CourseLessonCreateArgs} args - Arguments to create a CourseLesson.
     * @example
     * // Create one CourseLesson
     * const CourseLesson = await prisma.courseLesson.create({
     *   data: {
     *     // ... data to create a CourseLesson
     *   }
     * })
     * 
     */
    create<T extends CourseLessonCreateArgs>(args: SelectSubset<T, CourseLessonCreateArgs<ExtArgs>>): Prisma__CourseLessonClient<$Result.GetResult<Prisma.$CourseLessonPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many CourseLessons.
     * @param {CourseLessonCreateManyArgs} args - Arguments to create many CourseLessons.
     * @example
     * // Create many CourseLessons
     * const courseLesson = await prisma.courseLesson.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends CourseLessonCreateManyArgs>(args?: SelectSubset<T, CourseLessonCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many CourseLessons and returns the data saved in the database.
     * @param {CourseLessonCreateManyAndReturnArgs} args - Arguments to create many CourseLessons.
     * @example
     * // Create many CourseLessons
     * const courseLesson = await prisma.courseLesson.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many CourseLessons and only return the `id`
     * const courseLessonWithIdOnly = await prisma.courseLesson.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends CourseLessonCreateManyAndReturnArgs>(args?: SelectSubset<T, CourseLessonCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CourseLessonPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a CourseLesson.
     * @param {CourseLessonDeleteArgs} args - Arguments to delete one CourseLesson.
     * @example
     * // Delete one CourseLesson
     * const CourseLesson = await prisma.courseLesson.delete({
     *   where: {
     *     // ... filter to delete one CourseLesson
     *   }
     * })
     * 
     */
    delete<T extends CourseLessonDeleteArgs>(args: SelectSubset<T, CourseLessonDeleteArgs<ExtArgs>>): Prisma__CourseLessonClient<$Result.GetResult<Prisma.$CourseLessonPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one CourseLesson.
     * @param {CourseLessonUpdateArgs} args - Arguments to update one CourseLesson.
     * @example
     * // Update one CourseLesson
     * const courseLesson = await prisma.courseLesson.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends CourseLessonUpdateArgs>(args: SelectSubset<T, CourseLessonUpdateArgs<ExtArgs>>): Prisma__CourseLessonClient<$Result.GetResult<Prisma.$CourseLessonPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more CourseLessons.
     * @param {CourseLessonDeleteManyArgs} args - Arguments to filter CourseLessons to delete.
     * @example
     * // Delete a few CourseLessons
     * const { count } = await prisma.courseLesson.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends CourseLessonDeleteManyArgs>(args?: SelectSubset<T, CourseLessonDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more CourseLessons.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CourseLessonUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many CourseLessons
     * const courseLesson = await prisma.courseLesson.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends CourseLessonUpdateManyArgs>(args: SelectSubset<T, CourseLessonUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more CourseLessons and returns the data updated in the database.
     * @param {CourseLessonUpdateManyAndReturnArgs} args - Arguments to update many CourseLessons.
     * @example
     * // Update many CourseLessons
     * const courseLesson = await prisma.courseLesson.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more CourseLessons and only return the `id`
     * const courseLessonWithIdOnly = await prisma.courseLesson.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends CourseLessonUpdateManyAndReturnArgs>(args: SelectSubset<T, CourseLessonUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CourseLessonPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one CourseLesson.
     * @param {CourseLessonUpsertArgs} args - Arguments to update or create a CourseLesson.
     * @example
     * // Update or create a CourseLesson
     * const courseLesson = await prisma.courseLesson.upsert({
     *   create: {
     *     // ... data to create a CourseLesson
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the CourseLesson we want to update
     *   }
     * })
     */
    upsert<T extends CourseLessonUpsertArgs>(args: SelectSubset<T, CourseLessonUpsertArgs<ExtArgs>>): Prisma__CourseLessonClient<$Result.GetResult<Prisma.$CourseLessonPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of CourseLessons.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CourseLessonCountArgs} args - Arguments to filter CourseLessons to count.
     * @example
     * // Count the number of CourseLessons
     * const count = await prisma.courseLesson.count({
     *   where: {
     *     // ... the filter for the CourseLessons we want to count
     *   }
     * })
    **/
    count<T extends CourseLessonCountArgs>(
      args?: Subset<T, CourseLessonCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], CourseLessonCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a CourseLesson.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CourseLessonAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends CourseLessonAggregateArgs>(args: Subset<T, CourseLessonAggregateArgs>): Prisma.PrismaPromise<GetCourseLessonAggregateType<T>>

    /**
     * Group by CourseLesson.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CourseLessonGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends CourseLessonGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: CourseLessonGroupByArgs['orderBy'] }
        : { orderBy?: CourseLessonGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, CourseLessonGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetCourseLessonGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the CourseLesson model
   */
  readonly fields: CourseLessonFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for CourseLesson.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__CourseLessonClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    module<T extends CourseModuleDefaultArgs<ExtArgs> = {}>(args?: Subset<T, CourseModuleDefaultArgs<ExtArgs>>): Prisma__CourseModuleClient<$Result.GetResult<Prisma.$CourseModulePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the CourseLesson model
   */
  interface CourseLessonFieldRefs {
    readonly id: FieldRef<"CourseLesson", 'String'>
    readonly title: FieldRef<"CourseLesson", 'String'>
    readonly description: FieldRef<"CourseLesson", 'String'>
    readonly videoId: FieldRef<"CourseLesson", 'String'>
    readonly durationInMs: FieldRef<"CourseLesson", 'Int'>
    readonly order: FieldRef<"CourseLesson", 'Int'>
    readonly moduleId: FieldRef<"CourseLesson", 'String'>
    readonly createdAt: FieldRef<"CourseLesson", 'DateTime'>
    readonly updateAt: FieldRef<"CourseLesson", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * CourseLesson findUnique
   */
  export type CourseLessonFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CourseLesson
     */
    select?: CourseLessonSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CourseLesson
     */
    omit?: CourseLessonOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CourseLessonInclude<ExtArgs> | null
    /**
     * Filter, which CourseLesson to fetch.
     */
    where: CourseLessonWhereUniqueInput
  }

  /**
   * CourseLesson findUniqueOrThrow
   */
  export type CourseLessonFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CourseLesson
     */
    select?: CourseLessonSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CourseLesson
     */
    omit?: CourseLessonOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CourseLessonInclude<ExtArgs> | null
    /**
     * Filter, which CourseLesson to fetch.
     */
    where: CourseLessonWhereUniqueInput
  }

  /**
   * CourseLesson findFirst
   */
  export type CourseLessonFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CourseLesson
     */
    select?: CourseLessonSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CourseLesson
     */
    omit?: CourseLessonOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CourseLessonInclude<ExtArgs> | null
    /**
     * Filter, which CourseLesson to fetch.
     */
    where?: CourseLessonWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CourseLessons to fetch.
     */
    orderBy?: CourseLessonOrderByWithRelationInput | CourseLessonOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for CourseLessons.
     */
    cursor?: CourseLessonWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CourseLessons from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CourseLessons.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of CourseLessons.
     */
    distinct?: CourseLessonScalarFieldEnum | CourseLessonScalarFieldEnum[]
  }

  /**
   * CourseLesson findFirstOrThrow
   */
  export type CourseLessonFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CourseLesson
     */
    select?: CourseLessonSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CourseLesson
     */
    omit?: CourseLessonOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CourseLessonInclude<ExtArgs> | null
    /**
     * Filter, which CourseLesson to fetch.
     */
    where?: CourseLessonWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CourseLessons to fetch.
     */
    orderBy?: CourseLessonOrderByWithRelationInput | CourseLessonOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for CourseLessons.
     */
    cursor?: CourseLessonWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CourseLessons from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CourseLessons.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of CourseLessons.
     */
    distinct?: CourseLessonScalarFieldEnum | CourseLessonScalarFieldEnum[]
  }

  /**
   * CourseLesson findMany
   */
  export type CourseLessonFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CourseLesson
     */
    select?: CourseLessonSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CourseLesson
     */
    omit?: CourseLessonOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CourseLessonInclude<ExtArgs> | null
    /**
     * Filter, which CourseLessons to fetch.
     */
    where?: CourseLessonWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CourseLessons to fetch.
     */
    orderBy?: CourseLessonOrderByWithRelationInput | CourseLessonOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing CourseLessons.
     */
    cursor?: CourseLessonWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CourseLessons from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CourseLessons.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of CourseLessons.
     */
    distinct?: CourseLessonScalarFieldEnum | CourseLessonScalarFieldEnum[]
  }

  /**
   * CourseLesson create
   */
  export type CourseLessonCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CourseLesson
     */
    select?: CourseLessonSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CourseLesson
     */
    omit?: CourseLessonOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CourseLessonInclude<ExtArgs> | null
    /**
     * The data needed to create a CourseLesson.
     */
    data: XOR<CourseLessonCreateInput, CourseLessonUncheckedCreateInput>
  }

  /**
   * CourseLesson createMany
   */
  export type CourseLessonCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many CourseLessons.
     */
    data: CourseLessonCreateManyInput | CourseLessonCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * CourseLesson createManyAndReturn
   */
  export type CourseLessonCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CourseLesson
     */
    select?: CourseLessonSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the CourseLesson
     */
    omit?: CourseLessonOmit<ExtArgs> | null
    /**
     * The data used to create many CourseLessons.
     */
    data: CourseLessonCreateManyInput | CourseLessonCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CourseLessonIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * CourseLesson update
   */
  export type CourseLessonUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CourseLesson
     */
    select?: CourseLessonSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CourseLesson
     */
    omit?: CourseLessonOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CourseLessonInclude<ExtArgs> | null
    /**
     * The data needed to update a CourseLesson.
     */
    data: XOR<CourseLessonUpdateInput, CourseLessonUncheckedUpdateInput>
    /**
     * Choose, which CourseLesson to update.
     */
    where: CourseLessonWhereUniqueInput
  }

  /**
   * CourseLesson updateMany
   */
  export type CourseLessonUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update CourseLessons.
     */
    data: XOR<CourseLessonUpdateManyMutationInput, CourseLessonUncheckedUpdateManyInput>
    /**
     * Filter which CourseLessons to update
     */
    where?: CourseLessonWhereInput
    /**
     * Limit how many CourseLessons to update.
     */
    limit?: number
  }

  /**
   * CourseLesson updateManyAndReturn
   */
  export type CourseLessonUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CourseLesson
     */
    select?: CourseLessonSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the CourseLesson
     */
    omit?: CourseLessonOmit<ExtArgs> | null
    /**
     * The data used to update CourseLessons.
     */
    data: XOR<CourseLessonUpdateManyMutationInput, CourseLessonUncheckedUpdateManyInput>
    /**
     * Filter which CourseLessons to update
     */
    where?: CourseLessonWhereInput
    /**
     * Limit how many CourseLessons to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CourseLessonIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * CourseLesson upsert
   */
  export type CourseLessonUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CourseLesson
     */
    select?: CourseLessonSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CourseLesson
     */
    omit?: CourseLessonOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CourseLessonInclude<ExtArgs> | null
    /**
     * The filter to search for the CourseLesson to update in case it exists.
     */
    where: CourseLessonWhereUniqueInput
    /**
     * In case the CourseLesson found by the `where` argument doesn't exist, create a new CourseLesson with this data.
     */
    create: XOR<CourseLessonCreateInput, CourseLessonUncheckedCreateInput>
    /**
     * In case the CourseLesson was found with the provided `where` argument, update it with this data.
     */
    update: XOR<CourseLessonUpdateInput, CourseLessonUncheckedUpdateInput>
  }

  /**
   * CourseLesson delete
   */
  export type CourseLessonDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CourseLesson
     */
    select?: CourseLessonSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CourseLesson
     */
    omit?: CourseLessonOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CourseLessonInclude<ExtArgs> | null
    /**
     * Filter which CourseLesson to delete.
     */
    where: CourseLessonWhereUniqueInput
  }

  /**
   * CourseLesson deleteMany
   */
  export type CourseLessonDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which CourseLessons to delete
     */
    where?: CourseLessonWhereInput
    /**
     * Limit how many CourseLessons to delete.
     */
    limit?: number
  }

  /**
   * CourseLesson without action
   */
  export type CourseLessonDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CourseLesson
     */
    select?: CourseLessonSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CourseLesson
     */
    omit?: CourseLessonOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CourseLessonInclude<ExtArgs> | null
  }


  /**
   * Enums
   */

  export const TransactionIsolationLevel: {
    ReadUncommitted: 'ReadUncommitted',
    ReadCommitted: 'ReadCommitted',
    RepeatableRead: 'RepeatableRead',
    Serializable: 'Serializable'
  };

  export type TransactionIsolationLevel = (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel]


  export const UserScalarFieldEnum: {
    id: 'id',
    firstName: 'firstName',
    lastName: 'lastName',
    email: 'email',
    clerkUserId: 'clerkUserId',
    imageUrl: 'imageUrl',
    createdAt: 'createdAt',
    updateAt: 'updateAt'
  };

  export type UserScalarFieldEnum = (typeof UserScalarFieldEnum)[keyof typeof UserScalarFieldEnum]


  export const CourseTagScalarFieldEnum: {
    id: 'id',
    name: 'name',
    createdAt: 'createdAt',
    updateAt: 'updateAt',
    courseId: 'courseId'
  };

  export type CourseTagScalarFieldEnum = (typeof CourseTagScalarFieldEnum)[keyof typeof CourseTagScalarFieldEnum]


  export const CourseScalarFieldEnum: {
    id: 'id',
    status: 'status',
    title: 'title',
    slug: 'slug',
    description: 'description',
    shortDescription: 'shortDescription',
    thumbnail: 'thumbnail',
    price: 'price',
    discountPrice: 'discountPrice',
    difficulty: 'difficulty',
    createdAt: 'createdAt',
    updateAt: 'updateAt'
  };

  export type CourseScalarFieldEnum = (typeof CourseScalarFieldEnum)[keyof typeof CourseScalarFieldEnum]


  export const CourseModuleScalarFieldEnum: {
    id: 'id',
    title: 'title',
    description: 'description',
    courseId: 'courseId',
    order: 'order',
    createdAt: 'createdAt',
    updateAt: 'updateAt'
  };

  export type CourseModuleScalarFieldEnum = (typeof CourseModuleScalarFieldEnum)[keyof typeof CourseModuleScalarFieldEnum]


  export const CourseLessonScalarFieldEnum: {
    id: 'id',
    title: 'title',
    description: 'description',
    videoId: 'videoId',
    durationInMs: 'durationInMs',
    order: 'order',
    moduleId: 'moduleId',
    createdAt: 'createdAt',
    updateAt: 'updateAt'
  };

  export type CourseLessonScalarFieldEnum = (typeof CourseLessonScalarFieldEnum)[keyof typeof CourseLessonScalarFieldEnum]


  export const SortOrder: {
    asc: 'asc',
    desc: 'desc'
  };

  export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder]


  export const QueryMode: {
    default: 'default',
    insensitive: 'insensitive'
  };

  export type QueryMode = (typeof QueryMode)[keyof typeof QueryMode]


  export const NullsOrder: {
    first: 'first',
    last: 'last'
  };

  export type NullsOrder = (typeof NullsOrder)[keyof typeof NullsOrder]


  /**
   * Field references
   */


  /**
   * Reference to a field of type 'String'
   */
  export type StringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String'>
    


  /**
   * Reference to a field of type 'String[]'
   */
  export type ListStringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String[]'>
    


  /**
   * Reference to a field of type 'DateTime'
   */
  export type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime'>
    


  /**
   * Reference to a field of type 'DateTime[]'
   */
  export type ListDateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime[]'>
    


  /**
   * Reference to a field of type 'CourseStatus'
   */
  export type EnumCourseStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'CourseStatus'>
    


  /**
   * Reference to a field of type 'CourseStatus[]'
   */
  export type ListEnumCourseStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'CourseStatus[]'>
    


  /**
   * Reference to a field of type 'Float'
   */
  export type FloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float'>
    


  /**
   * Reference to a field of type 'Float[]'
   */
  export type ListFloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float[]'>
    


  /**
   * Reference to a field of type 'CourseDifficulty'
   */
  export type EnumCourseDifficultyFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'CourseDifficulty'>
    


  /**
   * Reference to a field of type 'CourseDifficulty[]'
   */
  export type ListEnumCourseDifficultyFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'CourseDifficulty[]'>
    


  /**
   * Reference to a field of type 'Int'
   */
  export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int'>
    


  /**
   * Reference to a field of type 'Int[]'
   */
  export type ListIntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int[]'>
    
  /**
   * Deep Input Types
   */


  export type UserWhereInput = {
    AND?: UserWhereInput | UserWhereInput[]
    OR?: UserWhereInput[]
    NOT?: UserWhereInput | UserWhereInput[]
    id?: StringFilter<"User"> | string
    firstName?: StringFilter<"User"> | string
    lastName?: StringNullableFilter<"User"> | string | null
    email?: StringFilter<"User"> | string
    clerkUserId?: StringFilter<"User"> | string
    imageUrl?: StringNullableFilter<"User"> | string | null
    createdAt?: DateTimeFilter<"User"> | Date | string
    updateAt?: DateTimeFilter<"User"> | Date | string
  }

  export type UserOrderByWithRelationInput = {
    id?: SortOrder
    firstName?: SortOrder
    lastName?: SortOrderInput | SortOrder
    email?: SortOrder
    clerkUserId?: SortOrder
    imageUrl?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updateAt?: SortOrder
  }

  export type UserWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    email?: string
    clerkUserId?: string
    AND?: UserWhereInput | UserWhereInput[]
    OR?: UserWhereInput[]
    NOT?: UserWhereInput | UserWhereInput[]
    firstName?: StringFilter<"User"> | string
    lastName?: StringNullableFilter<"User"> | string | null
    imageUrl?: StringNullableFilter<"User"> | string | null
    createdAt?: DateTimeFilter<"User"> | Date | string
    updateAt?: DateTimeFilter<"User"> | Date | string
  }, "id" | "email" | "clerkUserId">

  export type UserOrderByWithAggregationInput = {
    id?: SortOrder
    firstName?: SortOrder
    lastName?: SortOrderInput | SortOrder
    email?: SortOrder
    clerkUserId?: SortOrder
    imageUrl?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updateAt?: SortOrder
    _count?: UserCountOrderByAggregateInput
    _max?: UserMaxOrderByAggregateInput
    _min?: UserMinOrderByAggregateInput
  }

  export type UserScalarWhereWithAggregatesInput = {
    AND?: UserScalarWhereWithAggregatesInput | UserScalarWhereWithAggregatesInput[]
    OR?: UserScalarWhereWithAggregatesInput[]
    NOT?: UserScalarWhereWithAggregatesInput | UserScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"User"> | string
    firstName?: StringWithAggregatesFilter<"User"> | string
    lastName?: StringNullableWithAggregatesFilter<"User"> | string | null
    email?: StringWithAggregatesFilter<"User"> | string
    clerkUserId?: StringWithAggregatesFilter<"User"> | string
    imageUrl?: StringNullableWithAggregatesFilter<"User"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"User"> | Date | string
    updateAt?: DateTimeWithAggregatesFilter<"User"> | Date | string
  }

  export type CourseTagWhereInput = {
    AND?: CourseTagWhereInput | CourseTagWhereInput[]
    OR?: CourseTagWhereInput[]
    NOT?: CourseTagWhereInput | CourseTagWhereInput[]
    id?: StringFilter<"CourseTag"> | string
    name?: StringFilter<"CourseTag"> | string
    createdAt?: DateTimeFilter<"CourseTag"> | Date | string
    updateAt?: DateTimeFilter<"CourseTag"> | Date | string
    courseId?: StringNullableFilter<"CourseTag"> | string | null
    course?: XOR<CourseNullableScalarRelationFilter, CourseWhereInput> | null
  }

  export type CourseTagOrderByWithRelationInput = {
    id?: SortOrder
    name?: SortOrder
    createdAt?: SortOrder
    updateAt?: SortOrder
    courseId?: SortOrderInput | SortOrder
    course?: CourseOrderByWithRelationInput
  }

  export type CourseTagWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    name?: string
    AND?: CourseTagWhereInput | CourseTagWhereInput[]
    OR?: CourseTagWhereInput[]
    NOT?: CourseTagWhereInput | CourseTagWhereInput[]
    createdAt?: DateTimeFilter<"CourseTag"> | Date | string
    updateAt?: DateTimeFilter<"CourseTag"> | Date | string
    courseId?: StringNullableFilter<"CourseTag"> | string | null
    course?: XOR<CourseNullableScalarRelationFilter, CourseWhereInput> | null
  }, "id" | "name">

  export type CourseTagOrderByWithAggregationInput = {
    id?: SortOrder
    name?: SortOrder
    createdAt?: SortOrder
    updateAt?: SortOrder
    courseId?: SortOrderInput | SortOrder
    _count?: CourseTagCountOrderByAggregateInput
    _max?: CourseTagMaxOrderByAggregateInput
    _min?: CourseTagMinOrderByAggregateInput
  }

  export type CourseTagScalarWhereWithAggregatesInput = {
    AND?: CourseTagScalarWhereWithAggregatesInput | CourseTagScalarWhereWithAggregatesInput[]
    OR?: CourseTagScalarWhereWithAggregatesInput[]
    NOT?: CourseTagScalarWhereWithAggregatesInput | CourseTagScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"CourseTag"> | string
    name?: StringWithAggregatesFilter<"CourseTag"> | string
    createdAt?: DateTimeWithAggregatesFilter<"CourseTag"> | Date | string
    updateAt?: DateTimeWithAggregatesFilter<"CourseTag"> | Date | string
    courseId?: StringNullableWithAggregatesFilter<"CourseTag"> | string | null
  }

  export type CourseWhereInput = {
    AND?: CourseWhereInput | CourseWhereInput[]
    OR?: CourseWhereInput[]
    NOT?: CourseWhereInput | CourseWhereInput[]
    id?: StringFilter<"Course"> | string
    status?: EnumCourseStatusFilter<"Course"> | $Enums.CourseStatus
    title?: StringFilter<"Course"> | string
    slug?: StringFilter<"Course"> | string
    description?: StringFilter<"Course"> | string
    shortDescription?: StringNullableFilter<"Course"> | string | null
    thumbnail?: StringFilter<"Course"> | string
    price?: FloatFilter<"Course"> | number
    discountPrice?: FloatNullableFilter<"Course"> | number | null
    difficulty?: EnumCourseDifficultyFilter<"Course"> | $Enums.CourseDifficulty
    createdAt?: DateTimeFilter<"Course"> | Date | string
    updateAt?: DateTimeFilter<"Course"> | Date | string
    tags?: CourseTagListRelationFilter
    modules?: CourseModuleListRelationFilter
  }

  export type CourseOrderByWithRelationInput = {
    id?: SortOrder
    status?: SortOrder
    title?: SortOrder
    slug?: SortOrder
    description?: SortOrder
    shortDescription?: SortOrderInput | SortOrder
    thumbnail?: SortOrder
    price?: SortOrder
    discountPrice?: SortOrderInput | SortOrder
    difficulty?: SortOrder
    createdAt?: SortOrder
    updateAt?: SortOrder
    tags?: CourseTagOrderByRelationAggregateInput
    modules?: CourseModuleOrderByRelationAggregateInput
  }

  export type CourseWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    slug?: string
    AND?: CourseWhereInput | CourseWhereInput[]
    OR?: CourseWhereInput[]
    NOT?: CourseWhereInput | CourseWhereInput[]
    status?: EnumCourseStatusFilter<"Course"> | $Enums.CourseStatus
    title?: StringFilter<"Course"> | string
    description?: StringFilter<"Course"> | string
    shortDescription?: StringNullableFilter<"Course"> | string | null
    thumbnail?: StringFilter<"Course"> | string
    price?: FloatFilter<"Course"> | number
    discountPrice?: FloatNullableFilter<"Course"> | number | null
    difficulty?: EnumCourseDifficultyFilter<"Course"> | $Enums.CourseDifficulty
    createdAt?: DateTimeFilter<"Course"> | Date | string
    updateAt?: DateTimeFilter<"Course"> | Date | string
    tags?: CourseTagListRelationFilter
    modules?: CourseModuleListRelationFilter
  }, "id" | "slug">

  export type CourseOrderByWithAggregationInput = {
    id?: SortOrder
    status?: SortOrder
    title?: SortOrder
    slug?: SortOrder
    description?: SortOrder
    shortDescription?: SortOrderInput | SortOrder
    thumbnail?: SortOrder
    price?: SortOrder
    discountPrice?: SortOrderInput | SortOrder
    difficulty?: SortOrder
    createdAt?: SortOrder
    updateAt?: SortOrder
    _count?: CourseCountOrderByAggregateInput
    _avg?: CourseAvgOrderByAggregateInput
    _max?: CourseMaxOrderByAggregateInput
    _min?: CourseMinOrderByAggregateInput
    _sum?: CourseSumOrderByAggregateInput
  }

  export type CourseScalarWhereWithAggregatesInput = {
    AND?: CourseScalarWhereWithAggregatesInput | CourseScalarWhereWithAggregatesInput[]
    OR?: CourseScalarWhereWithAggregatesInput[]
    NOT?: CourseScalarWhereWithAggregatesInput | CourseScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Course"> | string
    status?: EnumCourseStatusWithAggregatesFilter<"Course"> | $Enums.CourseStatus
    title?: StringWithAggregatesFilter<"Course"> | string
    slug?: StringWithAggregatesFilter<"Course"> | string
    description?: StringWithAggregatesFilter<"Course"> | string
    shortDescription?: StringNullableWithAggregatesFilter<"Course"> | string | null
    thumbnail?: StringWithAggregatesFilter<"Course"> | string
    price?: FloatWithAggregatesFilter<"Course"> | number
    discountPrice?: FloatNullableWithAggregatesFilter<"Course"> | number | null
    difficulty?: EnumCourseDifficultyWithAggregatesFilter<"Course"> | $Enums.CourseDifficulty
    createdAt?: DateTimeWithAggregatesFilter<"Course"> | Date | string
    updateAt?: DateTimeWithAggregatesFilter<"Course"> | Date | string
  }

  export type CourseModuleWhereInput = {
    AND?: CourseModuleWhereInput | CourseModuleWhereInput[]
    OR?: CourseModuleWhereInput[]
    NOT?: CourseModuleWhereInput | CourseModuleWhereInput[]
    id?: StringFilter<"CourseModule"> | string
    title?: StringFilter<"CourseModule"> | string
    description?: StringFilter<"CourseModule"> | string
    courseId?: StringFilter<"CourseModule"> | string
    order?: IntFilter<"CourseModule"> | number
    createdAt?: DateTimeFilter<"CourseModule"> | Date | string
    updateAt?: DateTimeFilter<"CourseModule"> | Date | string
    course?: XOR<CourseScalarRelationFilter, CourseWhereInput>
    lessons?: CourseLessonListRelationFilter
  }

  export type CourseModuleOrderByWithRelationInput = {
    id?: SortOrder
    title?: SortOrder
    description?: SortOrder
    courseId?: SortOrder
    order?: SortOrder
    createdAt?: SortOrder
    updateAt?: SortOrder
    course?: CourseOrderByWithRelationInput
    lessons?: CourseLessonOrderByRelationAggregateInput
  }

  export type CourseModuleWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: CourseModuleWhereInput | CourseModuleWhereInput[]
    OR?: CourseModuleWhereInput[]
    NOT?: CourseModuleWhereInput | CourseModuleWhereInput[]
    title?: StringFilter<"CourseModule"> | string
    description?: StringFilter<"CourseModule"> | string
    courseId?: StringFilter<"CourseModule"> | string
    order?: IntFilter<"CourseModule"> | number
    createdAt?: DateTimeFilter<"CourseModule"> | Date | string
    updateAt?: DateTimeFilter<"CourseModule"> | Date | string
    course?: XOR<CourseScalarRelationFilter, CourseWhereInput>
    lessons?: CourseLessonListRelationFilter
  }, "id">

  export type CourseModuleOrderByWithAggregationInput = {
    id?: SortOrder
    title?: SortOrder
    description?: SortOrder
    courseId?: SortOrder
    order?: SortOrder
    createdAt?: SortOrder
    updateAt?: SortOrder
    _count?: CourseModuleCountOrderByAggregateInput
    _avg?: CourseModuleAvgOrderByAggregateInput
    _max?: CourseModuleMaxOrderByAggregateInput
    _min?: CourseModuleMinOrderByAggregateInput
    _sum?: CourseModuleSumOrderByAggregateInput
  }

  export type CourseModuleScalarWhereWithAggregatesInput = {
    AND?: CourseModuleScalarWhereWithAggregatesInput | CourseModuleScalarWhereWithAggregatesInput[]
    OR?: CourseModuleScalarWhereWithAggregatesInput[]
    NOT?: CourseModuleScalarWhereWithAggregatesInput | CourseModuleScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"CourseModule"> | string
    title?: StringWithAggregatesFilter<"CourseModule"> | string
    description?: StringWithAggregatesFilter<"CourseModule"> | string
    courseId?: StringWithAggregatesFilter<"CourseModule"> | string
    order?: IntWithAggregatesFilter<"CourseModule"> | number
    createdAt?: DateTimeWithAggregatesFilter<"CourseModule"> | Date | string
    updateAt?: DateTimeWithAggregatesFilter<"CourseModule"> | Date | string
  }

  export type CourseLessonWhereInput = {
    AND?: CourseLessonWhereInput | CourseLessonWhereInput[]
    OR?: CourseLessonWhereInput[]
    NOT?: CourseLessonWhereInput | CourseLessonWhereInput[]
    id?: StringFilter<"CourseLesson"> | string
    title?: StringFilter<"CourseLesson"> | string
    description?: StringFilter<"CourseLesson"> | string
    videoId?: StringFilter<"CourseLesson"> | string
    durationInMs?: IntFilter<"CourseLesson"> | number
    order?: IntFilter<"CourseLesson"> | number
    moduleId?: StringFilter<"CourseLesson"> | string
    createdAt?: DateTimeFilter<"CourseLesson"> | Date | string
    updateAt?: DateTimeFilter<"CourseLesson"> | Date | string
    module?: XOR<CourseModuleScalarRelationFilter, CourseModuleWhereInput>
  }

  export type CourseLessonOrderByWithRelationInput = {
    id?: SortOrder
    title?: SortOrder
    description?: SortOrder
    videoId?: SortOrder
    durationInMs?: SortOrder
    order?: SortOrder
    moduleId?: SortOrder
    createdAt?: SortOrder
    updateAt?: SortOrder
    module?: CourseModuleOrderByWithRelationInput
  }

  export type CourseLessonWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: CourseLessonWhereInput | CourseLessonWhereInput[]
    OR?: CourseLessonWhereInput[]
    NOT?: CourseLessonWhereInput | CourseLessonWhereInput[]
    title?: StringFilter<"CourseLesson"> | string
    description?: StringFilter<"CourseLesson"> | string
    videoId?: StringFilter<"CourseLesson"> | string
    durationInMs?: IntFilter<"CourseLesson"> | number
    order?: IntFilter<"CourseLesson"> | number
    moduleId?: StringFilter<"CourseLesson"> | string
    createdAt?: DateTimeFilter<"CourseLesson"> | Date | string
    updateAt?: DateTimeFilter<"CourseLesson"> | Date | string
    module?: XOR<CourseModuleScalarRelationFilter, CourseModuleWhereInput>
  }, "id">

  export type CourseLessonOrderByWithAggregationInput = {
    id?: SortOrder
    title?: SortOrder
    description?: SortOrder
    videoId?: SortOrder
    durationInMs?: SortOrder
    order?: SortOrder
    moduleId?: SortOrder
    createdAt?: SortOrder
    updateAt?: SortOrder
    _count?: CourseLessonCountOrderByAggregateInput
    _avg?: CourseLessonAvgOrderByAggregateInput
    _max?: CourseLessonMaxOrderByAggregateInput
    _min?: CourseLessonMinOrderByAggregateInput
    _sum?: CourseLessonSumOrderByAggregateInput
  }

  export type CourseLessonScalarWhereWithAggregatesInput = {
    AND?: CourseLessonScalarWhereWithAggregatesInput | CourseLessonScalarWhereWithAggregatesInput[]
    OR?: CourseLessonScalarWhereWithAggregatesInput[]
    NOT?: CourseLessonScalarWhereWithAggregatesInput | CourseLessonScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"CourseLesson"> | string
    title?: StringWithAggregatesFilter<"CourseLesson"> | string
    description?: StringWithAggregatesFilter<"CourseLesson"> | string
    videoId?: StringWithAggregatesFilter<"CourseLesson"> | string
    durationInMs?: IntWithAggregatesFilter<"CourseLesson"> | number
    order?: IntWithAggregatesFilter<"CourseLesson"> | number
    moduleId?: StringWithAggregatesFilter<"CourseLesson"> | string
    createdAt?: DateTimeWithAggregatesFilter<"CourseLesson"> | Date | string
    updateAt?: DateTimeWithAggregatesFilter<"CourseLesson"> | Date | string
  }

  export type UserCreateInput = {
    id?: string
    firstName: string
    lastName?: string | null
    email: string
    clerkUserId: string
    imageUrl?: string | null
    createdAt?: Date | string
    updateAt?: Date | string
  }

  export type UserUncheckedCreateInput = {
    id?: string
    firstName: string
    lastName?: string | null
    email: string
    clerkUserId: string
    imageUrl?: string | null
    createdAt?: Date | string
    updateAt?: Date | string
  }

  export type UserUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    firstName?: StringFieldUpdateOperationsInput | string
    lastName?: NullableStringFieldUpdateOperationsInput | string | null
    email?: StringFieldUpdateOperationsInput | string
    clerkUserId?: StringFieldUpdateOperationsInput | string
    imageUrl?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updateAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    firstName?: StringFieldUpdateOperationsInput | string
    lastName?: NullableStringFieldUpdateOperationsInput | string | null
    email?: StringFieldUpdateOperationsInput | string
    clerkUserId?: StringFieldUpdateOperationsInput | string
    imageUrl?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updateAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserCreateManyInput = {
    id?: string
    firstName: string
    lastName?: string | null
    email: string
    clerkUserId: string
    imageUrl?: string | null
    createdAt?: Date | string
    updateAt?: Date | string
  }

  export type UserUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    firstName?: StringFieldUpdateOperationsInput | string
    lastName?: NullableStringFieldUpdateOperationsInput | string | null
    email?: StringFieldUpdateOperationsInput | string
    clerkUserId?: StringFieldUpdateOperationsInput | string
    imageUrl?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updateAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    firstName?: StringFieldUpdateOperationsInput | string
    lastName?: NullableStringFieldUpdateOperationsInput | string | null
    email?: StringFieldUpdateOperationsInput | string
    clerkUserId?: StringFieldUpdateOperationsInput | string
    imageUrl?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updateAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CourseTagCreateInput = {
    id?: string
    name: string
    createdAt?: Date | string
    updateAt?: Date | string
    course?: CourseCreateNestedOneWithoutTagsInput
  }

  export type CourseTagUncheckedCreateInput = {
    id?: string
    name: string
    createdAt?: Date | string
    updateAt?: Date | string
    courseId?: string | null
  }

  export type CourseTagUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updateAt?: DateTimeFieldUpdateOperationsInput | Date | string
    course?: CourseUpdateOneWithoutTagsNestedInput
  }

  export type CourseTagUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updateAt?: DateTimeFieldUpdateOperationsInput | Date | string
    courseId?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type CourseTagCreateManyInput = {
    id?: string
    name: string
    createdAt?: Date | string
    updateAt?: Date | string
    courseId?: string | null
  }

  export type CourseTagUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updateAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CourseTagUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updateAt?: DateTimeFieldUpdateOperationsInput | Date | string
    courseId?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type CourseCreateInput = {
    id?: string
    status?: $Enums.CourseStatus
    title: string
    slug: string
    description: string
    shortDescription?: string | null
    thumbnail: string
    price: number
    discountPrice?: number | null
    difficulty?: $Enums.CourseDifficulty
    createdAt?: Date | string
    updateAt?: Date | string
    tags?: CourseTagCreateNestedManyWithoutCourseInput
    modules?: CourseModuleCreateNestedManyWithoutCourseInput
  }

  export type CourseUncheckedCreateInput = {
    id?: string
    status?: $Enums.CourseStatus
    title: string
    slug: string
    description: string
    shortDescription?: string | null
    thumbnail: string
    price: number
    discountPrice?: number | null
    difficulty?: $Enums.CourseDifficulty
    createdAt?: Date | string
    updateAt?: Date | string
    tags?: CourseTagUncheckedCreateNestedManyWithoutCourseInput
    modules?: CourseModuleUncheckedCreateNestedManyWithoutCourseInput
  }

  export type CourseUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    status?: EnumCourseStatusFieldUpdateOperationsInput | $Enums.CourseStatus
    title?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    shortDescription?: NullableStringFieldUpdateOperationsInput | string | null
    thumbnail?: StringFieldUpdateOperationsInput | string
    price?: FloatFieldUpdateOperationsInput | number
    discountPrice?: NullableFloatFieldUpdateOperationsInput | number | null
    difficulty?: EnumCourseDifficultyFieldUpdateOperationsInput | $Enums.CourseDifficulty
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updateAt?: DateTimeFieldUpdateOperationsInput | Date | string
    tags?: CourseTagUpdateManyWithoutCourseNestedInput
    modules?: CourseModuleUpdateManyWithoutCourseNestedInput
  }

  export type CourseUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    status?: EnumCourseStatusFieldUpdateOperationsInput | $Enums.CourseStatus
    title?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    shortDescription?: NullableStringFieldUpdateOperationsInput | string | null
    thumbnail?: StringFieldUpdateOperationsInput | string
    price?: FloatFieldUpdateOperationsInput | number
    discountPrice?: NullableFloatFieldUpdateOperationsInput | number | null
    difficulty?: EnumCourseDifficultyFieldUpdateOperationsInput | $Enums.CourseDifficulty
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updateAt?: DateTimeFieldUpdateOperationsInput | Date | string
    tags?: CourseTagUncheckedUpdateManyWithoutCourseNestedInput
    modules?: CourseModuleUncheckedUpdateManyWithoutCourseNestedInput
  }

  export type CourseCreateManyInput = {
    id?: string
    status?: $Enums.CourseStatus
    title: string
    slug: string
    description: string
    shortDescription?: string | null
    thumbnail: string
    price: number
    discountPrice?: number | null
    difficulty?: $Enums.CourseDifficulty
    createdAt?: Date | string
    updateAt?: Date | string
  }

  export type CourseUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    status?: EnumCourseStatusFieldUpdateOperationsInput | $Enums.CourseStatus
    title?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    shortDescription?: NullableStringFieldUpdateOperationsInput | string | null
    thumbnail?: StringFieldUpdateOperationsInput | string
    price?: FloatFieldUpdateOperationsInput | number
    discountPrice?: NullableFloatFieldUpdateOperationsInput | number | null
    difficulty?: EnumCourseDifficultyFieldUpdateOperationsInput | $Enums.CourseDifficulty
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updateAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CourseUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    status?: EnumCourseStatusFieldUpdateOperationsInput | $Enums.CourseStatus
    title?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    shortDescription?: NullableStringFieldUpdateOperationsInput | string | null
    thumbnail?: StringFieldUpdateOperationsInput | string
    price?: FloatFieldUpdateOperationsInput | number
    discountPrice?: NullableFloatFieldUpdateOperationsInput | number | null
    difficulty?: EnumCourseDifficultyFieldUpdateOperationsInput | $Enums.CourseDifficulty
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updateAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CourseModuleCreateInput = {
    id?: string
    title: string
    description: string
    order: number
    createdAt?: Date | string
    updateAt?: Date | string
    course: CourseCreateNestedOneWithoutModulesInput
    lessons?: CourseLessonCreateNestedManyWithoutModuleInput
  }

  export type CourseModuleUncheckedCreateInput = {
    id?: string
    title: string
    description: string
    courseId: string
    order: number
    createdAt?: Date | string
    updateAt?: Date | string
    lessons?: CourseLessonUncheckedCreateNestedManyWithoutModuleInput
  }

  export type CourseModuleUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    order?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updateAt?: DateTimeFieldUpdateOperationsInput | Date | string
    course?: CourseUpdateOneRequiredWithoutModulesNestedInput
    lessons?: CourseLessonUpdateManyWithoutModuleNestedInput
  }

  export type CourseModuleUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    courseId?: StringFieldUpdateOperationsInput | string
    order?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updateAt?: DateTimeFieldUpdateOperationsInput | Date | string
    lessons?: CourseLessonUncheckedUpdateManyWithoutModuleNestedInput
  }

  export type CourseModuleCreateManyInput = {
    id?: string
    title: string
    description: string
    courseId: string
    order: number
    createdAt?: Date | string
    updateAt?: Date | string
  }

  export type CourseModuleUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    order?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updateAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CourseModuleUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    courseId?: StringFieldUpdateOperationsInput | string
    order?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updateAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CourseLessonCreateInput = {
    id?: string
    title: string
    description: string
    videoId: string
    durationInMs: number
    order: number
    createdAt?: Date | string
    updateAt?: Date | string
    module: CourseModuleCreateNestedOneWithoutLessonsInput
  }

  export type CourseLessonUncheckedCreateInput = {
    id?: string
    title: string
    description: string
    videoId: string
    durationInMs: number
    order: number
    moduleId: string
    createdAt?: Date | string
    updateAt?: Date | string
  }

  export type CourseLessonUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    videoId?: StringFieldUpdateOperationsInput | string
    durationInMs?: IntFieldUpdateOperationsInput | number
    order?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updateAt?: DateTimeFieldUpdateOperationsInput | Date | string
    module?: CourseModuleUpdateOneRequiredWithoutLessonsNestedInput
  }

  export type CourseLessonUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    videoId?: StringFieldUpdateOperationsInput | string
    durationInMs?: IntFieldUpdateOperationsInput | number
    order?: IntFieldUpdateOperationsInput | number
    moduleId?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updateAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CourseLessonCreateManyInput = {
    id?: string
    title: string
    description: string
    videoId: string
    durationInMs: number
    order: number
    moduleId: string
    createdAt?: Date | string
    updateAt?: Date | string
  }

  export type CourseLessonUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    videoId?: StringFieldUpdateOperationsInput | string
    durationInMs?: IntFieldUpdateOperationsInput | number
    order?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updateAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CourseLessonUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    videoId?: StringFieldUpdateOperationsInput | string
    durationInMs?: IntFieldUpdateOperationsInput | number
    order?: IntFieldUpdateOperationsInput | number
    moduleId?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updateAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type StringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type StringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type DateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type SortOrderInput = {
    sort: SortOrder
    nulls?: NullsOrder
  }

  export type UserCountOrderByAggregateInput = {
    id?: SortOrder
    firstName?: SortOrder
    lastName?: SortOrder
    email?: SortOrder
    clerkUserId?: SortOrder
    imageUrl?: SortOrder
    createdAt?: SortOrder
    updateAt?: SortOrder
  }

  export type UserMaxOrderByAggregateInput = {
    id?: SortOrder
    firstName?: SortOrder
    lastName?: SortOrder
    email?: SortOrder
    clerkUserId?: SortOrder
    imageUrl?: SortOrder
    createdAt?: SortOrder
    updateAt?: SortOrder
  }

  export type UserMinOrderByAggregateInput = {
    id?: SortOrder
    firstName?: SortOrder
    lastName?: SortOrder
    email?: SortOrder
    clerkUserId?: SortOrder
    imageUrl?: SortOrder
    createdAt?: SortOrder
    updateAt?: SortOrder
  }

  export type StringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type StringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type DateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type CourseNullableScalarRelationFilter = {
    is?: CourseWhereInput | null
    isNot?: CourseWhereInput | null
  }

  export type CourseTagCountOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    createdAt?: SortOrder
    updateAt?: SortOrder
    courseId?: SortOrder
  }

  export type CourseTagMaxOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    createdAt?: SortOrder
    updateAt?: SortOrder
    courseId?: SortOrder
  }

  export type CourseTagMinOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    createdAt?: SortOrder
    updateAt?: SortOrder
    courseId?: SortOrder
  }

  export type EnumCourseStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.CourseStatus | EnumCourseStatusFieldRefInput<$PrismaModel>
    in?: $Enums.CourseStatus[] | ListEnumCourseStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.CourseStatus[] | ListEnumCourseStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumCourseStatusFilter<$PrismaModel> | $Enums.CourseStatus
  }

  export type FloatFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatFilter<$PrismaModel> | number
  }

  export type FloatNullableFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableFilter<$PrismaModel> | number | null
  }

  export type EnumCourseDifficultyFilter<$PrismaModel = never> = {
    equals?: $Enums.CourseDifficulty | EnumCourseDifficultyFieldRefInput<$PrismaModel>
    in?: $Enums.CourseDifficulty[] | ListEnumCourseDifficultyFieldRefInput<$PrismaModel>
    notIn?: $Enums.CourseDifficulty[] | ListEnumCourseDifficultyFieldRefInput<$PrismaModel>
    not?: NestedEnumCourseDifficultyFilter<$PrismaModel> | $Enums.CourseDifficulty
  }

  export type CourseTagListRelationFilter = {
    every?: CourseTagWhereInput
    some?: CourseTagWhereInput
    none?: CourseTagWhereInput
  }

  export type CourseModuleListRelationFilter = {
    every?: CourseModuleWhereInput
    some?: CourseModuleWhereInput
    none?: CourseModuleWhereInput
  }

  export type CourseTagOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type CourseModuleOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type CourseCountOrderByAggregateInput = {
    id?: SortOrder
    status?: SortOrder
    title?: SortOrder
    slug?: SortOrder
    description?: SortOrder
    shortDescription?: SortOrder
    thumbnail?: SortOrder
    price?: SortOrder
    discountPrice?: SortOrder
    difficulty?: SortOrder
    createdAt?: SortOrder
    updateAt?: SortOrder
  }

  export type CourseAvgOrderByAggregateInput = {
    price?: SortOrder
    discountPrice?: SortOrder
  }

  export type CourseMaxOrderByAggregateInput = {
    id?: SortOrder
    status?: SortOrder
    title?: SortOrder
    slug?: SortOrder
    description?: SortOrder
    shortDescription?: SortOrder
    thumbnail?: SortOrder
    price?: SortOrder
    discountPrice?: SortOrder
    difficulty?: SortOrder
    createdAt?: SortOrder
    updateAt?: SortOrder
  }

  export type CourseMinOrderByAggregateInput = {
    id?: SortOrder
    status?: SortOrder
    title?: SortOrder
    slug?: SortOrder
    description?: SortOrder
    shortDescription?: SortOrder
    thumbnail?: SortOrder
    price?: SortOrder
    discountPrice?: SortOrder
    difficulty?: SortOrder
    createdAt?: SortOrder
    updateAt?: SortOrder
  }

  export type CourseSumOrderByAggregateInput = {
    price?: SortOrder
    discountPrice?: SortOrder
  }

  export type EnumCourseStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.CourseStatus | EnumCourseStatusFieldRefInput<$PrismaModel>
    in?: $Enums.CourseStatus[] | ListEnumCourseStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.CourseStatus[] | ListEnumCourseStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumCourseStatusWithAggregatesFilter<$PrismaModel> | $Enums.CourseStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumCourseStatusFilter<$PrismaModel>
    _max?: NestedEnumCourseStatusFilter<$PrismaModel>
  }

  export type FloatWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedFloatFilter<$PrismaModel>
    _min?: NestedFloatFilter<$PrismaModel>
    _max?: NestedFloatFilter<$PrismaModel>
  }

  export type FloatNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedFloatNullableFilter<$PrismaModel>
    _min?: NestedFloatNullableFilter<$PrismaModel>
    _max?: NestedFloatNullableFilter<$PrismaModel>
  }

  export type EnumCourseDifficultyWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.CourseDifficulty | EnumCourseDifficultyFieldRefInput<$PrismaModel>
    in?: $Enums.CourseDifficulty[] | ListEnumCourseDifficultyFieldRefInput<$PrismaModel>
    notIn?: $Enums.CourseDifficulty[] | ListEnumCourseDifficultyFieldRefInput<$PrismaModel>
    not?: NestedEnumCourseDifficultyWithAggregatesFilter<$PrismaModel> | $Enums.CourseDifficulty
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumCourseDifficultyFilter<$PrismaModel>
    _max?: NestedEnumCourseDifficultyFilter<$PrismaModel>
  }

  export type IntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type CourseScalarRelationFilter = {
    is?: CourseWhereInput
    isNot?: CourseWhereInput
  }

  export type CourseLessonListRelationFilter = {
    every?: CourseLessonWhereInput
    some?: CourseLessonWhereInput
    none?: CourseLessonWhereInput
  }

  export type CourseLessonOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type CourseModuleCountOrderByAggregateInput = {
    id?: SortOrder
    title?: SortOrder
    description?: SortOrder
    courseId?: SortOrder
    order?: SortOrder
    createdAt?: SortOrder
    updateAt?: SortOrder
  }

  export type CourseModuleAvgOrderByAggregateInput = {
    order?: SortOrder
  }

  export type CourseModuleMaxOrderByAggregateInput = {
    id?: SortOrder
    title?: SortOrder
    description?: SortOrder
    courseId?: SortOrder
    order?: SortOrder
    createdAt?: SortOrder
    updateAt?: SortOrder
  }

  export type CourseModuleMinOrderByAggregateInput = {
    id?: SortOrder
    title?: SortOrder
    description?: SortOrder
    courseId?: SortOrder
    order?: SortOrder
    createdAt?: SortOrder
    updateAt?: SortOrder
  }

  export type CourseModuleSumOrderByAggregateInput = {
    order?: SortOrder
  }

  export type IntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type CourseModuleScalarRelationFilter = {
    is?: CourseModuleWhereInput
    isNot?: CourseModuleWhereInput
  }

  export type CourseLessonCountOrderByAggregateInput = {
    id?: SortOrder
    title?: SortOrder
    description?: SortOrder
    videoId?: SortOrder
    durationInMs?: SortOrder
    order?: SortOrder
    moduleId?: SortOrder
    createdAt?: SortOrder
    updateAt?: SortOrder
  }

  export type CourseLessonAvgOrderByAggregateInput = {
    durationInMs?: SortOrder
    order?: SortOrder
  }

  export type CourseLessonMaxOrderByAggregateInput = {
    id?: SortOrder
    title?: SortOrder
    description?: SortOrder
    videoId?: SortOrder
    durationInMs?: SortOrder
    order?: SortOrder
    moduleId?: SortOrder
    createdAt?: SortOrder
    updateAt?: SortOrder
  }

  export type CourseLessonMinOrderByAggregateInput = {
    id?: SortOrder
    title?: SortOrder
    description?: SortOrder
    videoId?: SortOrder
    durationInMs?: SortOrder
    order?: SortOrder
    moduleId?: SortOrder
    createdAt?: SortOrder
    updateAt?: SortOrder
  }

  export type CourseLessonSumOrderByAggregateInput = {
    durationInMs?: SortOrder
    order?: SortOrder
  }

  export type StringFieldUpdateOperationsInput = {
    set?: string
  }

  export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null
  }

  export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string
  }

  export type CourseCreateNestedOneWithoutTagsInput = {
    create?: XOR<CourseCreateWithoutTagsInput, CourseUncheckedCreateWithoutTagsInput>
    connectOrCreate?: CourseCreateOrConnectWithoutTagsInput
    connect?: CourseWhereUniqueInput
  }

  export type CourseUpdateOneWithoutTagsNestedInput = {
    create?: XOR<CourseCreateWithoutTagsInput, CourseUncheckedCreateWithoutTagsInput>
    connectOrCreate?: CourseCreateOrConnectWithoutTagsInput
    upsert?: CourseUpsertWithoutTagsInput
    disconnect?: CourseWhereInput | boolean
    delete?: CourseWhereInput | boolean
    connect?: CourseWhereUniqueInput
    update?: XOR<XOR<CourseUpdateToOneWithWhereWithoutTagsInput, CourseUpdateWithoutTagsInput>, CourseUncheckedUpdateWithoutTagsInput>
  }

  export type CourseTagCreateNestedManyWithoutCourseInput = {
    create?: XOR<CourseTagCreateWithoutCourseInput, CourseTagUncheckedCreateWithoutCourseInput> | CourseTagCreateWithoutCourseInput[] | CourseTagUncheckedCreateWithoutCourseInput[]
    connectOrCreate?: CourseTagCreateOrConnectWithoutCourseInput | CourseTagCreateOrConnectWithoutCourseInput[]
    createMany?: CourseTagCreateManyCourseInputEnvelope
    connect?: CourseTagWhereUniqueInput | CourseTagWhereUniqueInput[]
  }

  export type CourseModuleCreateNestedManyWithoutCourseInput = {
    create?: XOR<CourseModuleCreateWithoutCourseInput, CourseModuleUncheckedCreateWithoutCourseInput> | CourseModuleCreateWithoutCourseInput[] | CourseModuleUncheckedCreateWithoutCourseInput[]
    connectOrCreate?: CourseModuleCreateOrConnectWithoutCourseInput | CourseModuleCreateOrConnectWithoutCourseInput[]
    createMany?: CourseModuleCreateManyCourseInputEnvelope
    connect?: CourseModuleWhereUniqueInput | CourseModuleWhereUniqueInput[]
  }

  export type CourseTagUncheckedCreateNestedManyWithoutCourseInput = {
    create?: XOR<CourseTagCreateWithoutCourseInput, CourseTagUncheckedCreateWithoutCourseInput> | CourseTagCreateWithoutCourseInput[] | CourseTagUncheckedCreateWithoutCourseInput[]
    connectOrCreate?: CourseTagCreateOrConnectWithoutCourseInput | CourseTagCreateOrConnectWithoutCourseInput[]
    createMany?: CourseTagCreateManyCourseInputEnvelope
    connect?: CourseTagWhereUniqueInput | CourseTagWhereUniqueInput[]
  }

  export type CourseModuleUncheckedCreateNestedManyWithoutCourseInput = {
    create?: XOR<CourseModuleCreateWithoutCourseInput, CourseModuleUncheckedCreateWithoutCourseInput> | CourseModuleCreateWithoutCourseInput[] | CourseModuleUncheckedCreateWithoutCourseInput[]
    connectOrCreate?: CourseModuleCreateOrConnectWithoutCourseInput | CourseModuleCreateOrConnectWithoutCourseInput[]
    createMany?: CourseModuleCreateManyCourseInputEnvelope
    connect?: CourseModuleWhereUniqueInput | CourseModuleWhereUniqueInput[]
  }

  export type EnumCourseStatusFieldUpdateOperationsInput = {
    set?: $Enums.CourseStatus
  }

  export type FloatFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type NullableFloatFieldUpdateOperationsInput = {
    set?: number | null
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type EnumCourseDifficultyFieldUpdateOperationsInput = {
    set?: $Enums.CourseDifficulty
  }

  export type CourseTagUpdateManyWithoutCourseNestedInput = {
    create?: XOR<CourseTagCreateWithoutCourseInput, CourseTagUncheckedCreateWithoutCourseInput> | CourseTagCreateWithoutCourseInput[] | CourseTagUncheckedCreateWithoutCourseInput[]
    connectOrCreate?: CourseTagCreateOrConnectWithoutCourseInput | CourseTagCreateOrConnectWithoutCourseInput[]
    upsert?: CourseTagUpsertWithWhereUniqueWithoutCourseInput | CourseTagUpsertWithWhereUniqueWithoutCourseInput[]
    createMany?: CourseTagCreateManyCourseInputEnvelope
    set?: CourseTagWhereUniqueInput | CourseTagWhereUniqueInput[]
    disconnect?: CourseTagWhereUniqueInput | CourseTagWhereUniqueInput[]
    delete?: CourseTagWhereUniqueInput | CourseTagWhereUniqueInput[]
    connect?: CourseTagWhereUniqueInput | CourseTagWhereUniqueInput[]
    update?: CourseTagUpdateWithWhereUniqueWithoutCourseInput | CourseTagUpdateWithWhereUniqueWithoutCourseInput[]
    updateMany?: CourseTagUpdateManyWithWhereWithoutCourseInput | CourseTagUpdateManyWithWhereWithoutCourseInput[]
    deleteMany?: CourseTagScalarWhereInput | CourseTagScalarWhereInput[]
  }

  export type CourseModuleUpdateManyWithoutCourseNestedInput = {
    create?: XOR<CourseModuleCreateWithoutCourseInput, CourseModuleUncheckedCreateWithoutCourseInput> | CourseModuleCreateWithoutCourseInput[] | CourseModuleUncheckedCreateWithoutCourseInput[]
    connectOrCreate?: CourseModuleCreateOrConnectWithoutCourseInput | CourseModuleCreateOrConnectWithoutCourseInput[]
    upsert?: CourseModuleUpsertWithWhereUniqueWithoutCourseInput | CourseModuleUpsertWithWhereUniqueWithoutCourseInput[]
    createMany?: CourseModuleCreateManyCourseInputEnvelope
    set?: CourseModuleWhereUniqueInput | CourseModuleWhereUniqueInput[]
    disconnect?: CourseModuleWhereUniqueInput | CourseModuleWhereUniqueInput[]
    delete?: CourseModuleWhereUniqueInput | CourseModuleWhereUniqueInput[]
    connect?: CourseModuleWhereUniqueInput | CourseModuleWhereUniqueInput[]
    update?: CourseModuleUpdateWithWhereUniqueWithoutCourseInput | CourseModuleUpdateWithWhereUniqueWithoutCourseInput[]
    updateMany?: CourseModuleUpdateManyWithWhereWithoutCourseInput | CourseModuleUpdateManyWithWhereWithoutCourseInput[]
    deleteMany?: CourseModuleScalarWhereInput | CourseModuleScalarWhereInput[]
  }

  export type CourseTagUncheckedUpdateManyWithoutCourseNestedInput = {
    create?: XOR<CourseTagCreateWithoutCourseInput, CourseTagUncheckedCreateWithoutCourseInput> | CourseTagCreateWithoutCourseInput[] | CourseTagUncheckedCreateWithoutCourseInput[]
    connectOrCreate?: CourseTagCreateOrConnectWithoutCourseInput | CourseTagCreateOrConnectWithoutCourseInput[]
    upsert?: CourseTagUpsertWithWhereUniqueWithoutCourseInput | CourseTagUpsertWithWhereUniqueWithoutCourseInput[]
    createMany?: CourseTagCreateManyCourseInputEnvelope
    set?: CourseTagWhereUniqueInput | CourseTagWhereUniqueInput[]
    disconnect?: CourseTagWhereUniqueInput | CourseTagWhereUniqueInput[]
    delete?: CourseTagWhereUniqueInput | CourseTagWhereUniqueInput[]
    connect?: CourseTagWhereUniqueInput | CourseTagWhereUniqueInput[]
    update?: CourseTagUpdateWithWhereUniqueWithoutCourseInput | CourseTagUpdateWithWhereUniqueWithoutCourseInput[]
    updateMany?: CourseTagUpdateManyWithWhereWithoutCourseInput | CourseTagUpdateManyWithWhereWithoutCourseInput[]
    deleteMany?: CourseTagScalarWhereInput | CourseTagScalarWhereInput[]
  }

  export type CourseModuleUncheckedUpdateManyWithoutCourseNestedInput = {
    create?: XOR<CourseModuleCreateWithoutCourseInput, CourseModuleUncheckedCreateWithoutCourseInput> | CourseModuleCreateWithoutCourseInput[] | CourseModuleUncheckedCreateWithoutCourseInput[]
    connectOrCreate?: CourseModuleCreateOrConnectWithoutCourseInput | CourseModuleCreateOrConnectWithoutCourseInput[]
    upsert?: CourseModuleUpsertWithWhereUniqueWithoutCourseInput | CourseModuleUpsertWithWhereUniqueWithoutCourseInput[]
    createMany?: CourseModuleCreateManyCourseInputEnvelope
    set?: CourseModuleWhereUniqueInput | CourseModuleWhereUniqueInput[]
    disconnect?: CourseModuleWhereUniqueInput | CourseModuleWhereUniqueInput[]
    delete?: CourseModuleWhereUniqueInput | CourseModuleWhereUniqueInput[]
    connect?: CourseModuleWhereUniqueInput | CourseModuleWhereUniqueInput[]
    update?: CourseModuleUpdateWithWhereUniqueWithoutCourseInput | CourseModuleUpdateWithWhereUniqueWithoutCourseInput[]
    updateMany?: CourseModuleUpdateManyWithWhereWithoutCourseInput | CourseModuleUpdateManyWithWhereWithoutCourseInput[]
    deleteMany?: CourseModuleScalarWhereInput | CourseModuleScalarWhereInput[]
  }

  export type CourseCreateNestedOneWithoutModulesInput = {
    create?: XOR<CourseCreateWithoutModulesInput, CourseUncheckedCreateWithoutModulesInput>
    connectOrCreate?: CourseCreateOrConnectWithoutModulesInput
    connect?: CourseWhereUniqueInput
  }

  export type CourseLessonCreateNestedManyWithoutModuleInput = {
    create?: XOR<CourseLessonCreateWithoutModuleInput, CourseLessonUncheckedCreateWithoutModuleInput> | CourseLessonCreateWithoutModuleInput[] | CourseLessonUncheckedCreateWithoutModuleInput[]
    connectOrCreate?: CourseLessonCreateOrConnectWithoutModuleInput | CourseLessonCreateOrConnectWithoutModuleInput[]
    createMany?: CourseLessonCreateManyModuleInputEnvelope
    connect?: CourseLessonWhereUniqueInput | CourseLessonWhereUniqueInput[]
  }

  export type CourseLessonUncheckedCreateNestedManyWithoutModuleInput = {
    create?: XOR<CourseLessonCreateWithoutModuleInput, CourseLessonUncheckedCreateWithoutModuleInput> | CourseLessonCreateWithoutModuleInput[] | CourseLessonUncheckedCreateWithoutModuleInput[]
    connectOrCreate?: CourseLessonCreateOrConnectWithoutModuleInput | CourseLessonCreateOrConnectWithoutModuleInput[]
    createMany?: CourseLessonCreateManyModuleInputEnvelope
    connect?: CourseLessonWhereUniqueInput | CourseLessonWhereUniqueInput[]
  }

  export type IntFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type CourseUpdateOneRequiredWithoutModulesNestedInput = {
    create?: XOR<CourseCreateWithoutModulesInput, CourseUncheckedCreateWithoutModulesInput>
    connectOrCreate?: CourseCreateOrConnectWithoutModulesInput
    upsert?: CourseUpsertWithoutModulesInput
    connect?: CourseWhereUniqueInput
    update?: XOR<XOR<CourseUpdateToOneWithWhereWithoutModulesInput, CourseUpdateWithoutModulesInput>, CourseUncheckedUpdateWithoutModulesInput>
  }

  export type CourseLessonUpdateManyWithoutModuleNestedInput = {
    create?: XOR<CourseLessonCreateWithoutModuleInput, CourseLessonUncheckedCreateWithoutModuleInput> | CourseLessonCreateWithoutModuleInput[] | CourseLessonUncheckedCreateWithoutModuleInput[]
    connectOrCreate?: CourseLessonCreateOrConnectWithoutModuleInput | CourseLessonCreateOrConnectWithoutModuleInput[]
    upsert?: CourseLessonUpsertWithWhereUniqueWithoutModuleInput | CourseLessonUpsertWithWhereUniqueWithoutModuleInput[]
    createMany?: CourseLessonCreateManyModuleInputEnvelope
    set?: CourseLessonWhereUniqueInput | CourseLessonWhereUniqueInput[]
    disconnect?: CourseLessonWhereUniqueInput | CourseLessonWhereUniqueInput[]
    delete?: CourseLessonWhereUniqueInput | CourseLessonWhereUniqueInput[]
    connect?: CourseLessonWhereUniqueInput | CourseLessonWhereUniqueInput[]
    update?: CourseLessonUpdateWithWhereUniqueWithoutModuleInput | CourseLessonUpdateWithWhereUniqueWithoutModuleInput[]
    updateMany?: CourseLessonUpdateManyWithWhereWithoutModuleInput | CourseLessonUpdateManyWithWhereWithoutModuleInput[]
    deleteMany?: CourseLessonScalarWhereInput | CourseLessonScalarWhereInput[]
  }

  export type CourseLessonUncheckedUpdateManyWithoutModuleNestedInput = {
    create?: XOR<CourseLessonCreateWithoutModuleInput, CourseLessonUncheckedCreateWithoutModuleInput> | CourseLessonCreateWithoutModuleInput[] | CourseLessonUncheckedCreateWithoutModuleInput[]
    connectOrCreate?: CourseLessonCreateOrConnectWithoutModuleInput | CourseLessonCreateOrConnectWithoutModuleInput[]
    upsert?: CourseLessonUpsertWithWhereUniqueWithoutModuleInput | CourseLessonUpsertWithWhereUniqueWithoutModuleInput[]
    createMany?: CourseLessonCreateManyModuleInputEnvelope
    set?: CourseLessonWhereUniqueInput | CourseLessonWhereUniqueInput[]
    disconnect?: CourseLessonWhereUniqueInput | CourseLessonWhereUniqueInput[]
    delete?: CourseLessonWhereUniqueInput | CourseLessonWhereUniqueInput[]
    connect?: CourseLessonWhereUniqueInput | CourseLessonWhereUniqueInput[]
    update?: CourseLessonUpdateWithWhereUniqueWithoutModuleInput | CourseLessonUpdateWithWhereUniqueWithoutModuleInput[]
    updateMany?: CourseLessonUpdateManyWithWhereWithoutModuleInput | CourseLessonUpdateManyWithWhereWithoutModuleInput[]
    deleteMany?: CourseLessonScalarWhereInput | CourseLessonScalarWhereInput[]
  }

  export type CourseModuleCreateNestedOneWithoutLessonsInput = {
    create?: XOR<CourseModuleCreateWithoutLessonsInput, CourseModuleUncheckedCreateWithoutLessonsInput>
    connectOrCreate?: CourseModuleCreateOrConnectWithoutLessonsInput
    connect?: CourseModuleWhereUniqueInput
  }

  export type CourseModuleUpdateOneRequiredWithoutLessonsNestedInput = {
    create?: XOR<CourseModuleCreateWithoutLessonsInput, CourseModuleUncheckedCreateWithoutLessonsInput>
    connectOrCreate?: CourseModuleCreateOrConnectWithoutLessonsInput
    upsert?: CourseModuleUpsertWithoutLessonsInput
    connect?: CourseModuleWhereUniqueInput
    update?: XOR<XOR<CourseModuleUpdateToOneWithWhereWithoutLessonsInput, CourseModuleUpdateWithoutLessonsInput>, CourseModuleUncheckedUpdateWithoutLessonsInput>
  }

  export type NestedStringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type NestedStringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type NestedDateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type NestedStringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type NestedIntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type NestedStringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type NestedIntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type NestedDateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type NestedEnumCourseStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.CourseStatus | EnumCourseStatusFieldRefInput<$PrismaModel>
    in?: $Enums.CourseStatus[] | ListEnumCourseStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.CourseStatus[] | ListEnumCourseStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumCourseStatusFilter<$PrismaModel> | $Enums.CourseStatus
  }

  export type NestedFloatFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatFilter<$PrismaModel> | number
  }

  export type NestedFloatNullableFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableFilter<$PrismaModel> | number | null
  }

  export type NestedEnumCourseDifficultyFilter<$PrismaModel = never> = {
    equals?: $Enums.CourseDifficulty | EnumCourseDifficultyFieldRefInput<$PrismaModel>
    in?: $Enums.CourseDifficulty[] | ListEnumCourseDifficultyFieldRefInput<$PrismaModel>
    notIn?: $Enums.CourseDifficulty[] | ListEnumCourseDifficultyFieldRefInput<$PrismaModel>
    not?: NestedEnumCourseDifficultyFilter<$PrismaModel> | $Enums.CourseDifficulty
  }

  export type NestedEnumCourseStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.CourseStatus | EnumCourseStatusFieldRefInput<$PrismaModel>
    in?: $Enums.CourseStatus[] | ListEnumCourseStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.CourseStatus[] | ListEnumCourseStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumCourseStatusWithAggregatesFilter<$PrismaModel> | $Enums.CourseStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumCourseStatusFilter<$PrismaModel>
    _max?: NestedEnumCourseStatusFilter<$PrismaModel>
  }

  export type NestedFloatWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedFloatFilter<$PrismaModel>
    _min?: NestedFloatFilter<$PrismaModel>
    _max?: NestedFloatFilter<$PrismaModel>
  }

  export type NestedFloatNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedFloatNullableFilter<$PrismaModel>
    _min?: NestedFloatNullableFilter<$PrismaModel>
    _max?: NestedFloatNullableFilter<$PrismaModel>
  }

  export type NestedEnumCourseDifficultyWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.CourseDifficulty | EnumCourseDifficultyFieldRefInput<$PrismaModel>
    in?: $Enums.CourseDifficulty[] | ListEnumCourseDifficultyFieldRefInput<$PrismaModel>
    notIn?: $Enums.CourseDifficulty[] | ListEnumCourseDifficultyFieldRefInput<$PrismaModel>
    not?: NestedEnumCourseDifficultyWithAggregatesFilter<$PrismaModel> | $Enums.CourseDifficulty
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumCourseDifficultyFilter<$PrismaModel>
    _max?: NestedEnumCourseDifficultyFilter<$PrismaModel>
  }

  export type NestedIntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type CourseCreateWithoutTagsInput = {
    id?: string
    status?: $Enums.CourseStatus
    title: string
    slug: string
    description: string
    shortDescription?: string | null
    thumbnail: string
    price: number
    discountPrice?: number | null
    difficulty?: $Enums.CourseDifficulty
    createdAt?: Date | string
    updateAt?: Date | string
    modules?: CourseModuleCreateNestedManyWithoutCourseInput
  }

  export type CourseUncheckedCreateWithoutTagsInput = {
    id?: string
    status?: $Enums.CourseStatus
    title: string
    slug: string
    description: string
    shortDescription?: string | null
    thumbnail: string
    price: number
    discountPrice?: number | null
    difficulty?: $Enums.CourseDifficulty
    createdAt?: Date | string
    updateAt?: Date | string
    modules?: CourseModuleUncheckedCreateNestedManyWithoutCourseInput
  }

  export type CourseCreateOrConnectWithoutTagsInput = {
    where: CourseWhereUniqueInput
    create: XOR<CourseCreateWithoutTagsInput, CourseUncheckedCreateWithoutTagsInput>
  }

  export type CourseUpsertWithoutTagsInput = {
    update: XOR<CourseUpdateWithoutTagsInput, CourseUncheckedUpdateWithoutTagsInput>
    create: XOR<CourseCreateWithoutTagsInput, CourseUncheckedCreateWithoutTagsInput>
    where?: CourseWhereInput
  }

  export type CourseUpdateToOneWithWhereWithoutTagsInput = {
    where?: CourseWhereInput
    data: XOR<CourseUpdateWithoutTagsInput, CourseUncheckedUpdateWithoutTagsInput>
  }

  export type CourseUpdateWithoutTagsInput = {
    id?: StringFieldUpdateOperationsInput | string
    status?: EnumCourseStatusFieldUpdateOperationsInput | $Enums.CourseStatus
    title?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    shortDescription?: NullableStringFieldUpdateOperationsInput | string | null
    thumbnail?: StringFieldUpdateOperationsInput | string
    price?: FloatFieldUpdateOperationsInput | number
    discountPrice?: NullableFloatFieldUpdateOperationsInput | number | null
    difficulty?: EnumCourseDifficultyFieldUpdateOperationsInput | $Enums.CourseDifficulty
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updateAt?: DateTimeFieldUpdateOperationsInput | Date | string
    modules?: CourseModuleUpdateManyWithoutCourseNestedInput
  }

  export type CourseUncheckedUpdateWithoutTagsInput = {
    id?: StringFieldUpdateOperationsInput | string
    status?: EnumCourseStatusFieldUpdateOperationsInput | $Enums.CourseStatus
    title?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    shortDescription?: NullableStringFieldUpdateOperationsInput | string | null
    thumbnail?: StringFieldUpdateOperationsInput | string
    price?: FloatFieldUpdateOperationsInput | number
    discountPrice?: NullableFloatFieldUpdateOperationsInput | number | null
    difficulty?: EnumCourseDifficultyFieldUpdateOperationsInput | $Enums.CourseDifficulty
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updateAt?: DateTimeFieldUpdateOperationsInput | Date | string
    modules?: CourseModuleUncheckedUpdateManyWithoutCourseNestedInput
  }

  export type CourseTagCreateWithoutCourseInput = {
    id?: string
    name: string
    createdAt?: Date | string
    updateAt?: Date | string
  }

  export type CourseTagUncheckedCreateWithoutCourseInput = {
    id?: string
    name: string
    createdAt?: Date | string
    updateAt?: Date | string
  }

  export type CourseTagCreateOrConnectWithoutCourseInput = {
    where: CourseTagWhereUniqueInput
    create: XOR<CourseTagCreateWithoutCourseInput, CourseTagUncheckedCreateWithoutCourseInput>
  }

  export type CourseTagCreateManyCourseInputEnvelope = {
    data: CourseTagCreateManyCourseInput | CourseTagCreateManyCourseInput[]
    skipDuplicates?: boolean
  }

  export type CourseModuleCreateWithoutCourseInput = {
    id?: string
    title: string
    description: string
    order: number
    createdAt?: Date | string
    updateAt?: Date | string
    lessons?: CourseLessonCreateNestedManyWithoutModuleInput
  }

  export type CourseModuleUncheckedCreateWithoutCourseInput = {
    id?: string
    title: string
    description: string
    order: number
    createdAt?: Date | string
    updateAt?: Date | string
    lessons?: CourseLessonUncheckedCreateNestedManyWithoutModuleInput
  }

  export type CourseModuleCreateOrConnectWithoutCourseInput = {
    where: CourseModuleWhereUniqueInput
    create: XOR<CourseModuleCreateWithoutCourseInput, CourseModuleUncheckedCreateWithoutCourseInput>
  }

  export type CourseModuleCreateManyCourseInputEnvelope = {
    data: CourseModuleCreateManyCourseInput | CourseModuleCreateManyCourseInput[]
    skipDuplicates?: boolean
  }

  export type CourseTagUpsertWithWhereUniqueWithoutCourseInput = {
    where: CourseTagWhereUniqueInput
    update: XOR<CourseTagUpdateWithoutCourseInput, CourseTagUncheckedUpdateWithoutCourseInput>
    create: XOR<CourseTagCreateWithoutCourseInput, CourseTagUncheckedCreateWithoutCourseInput>
  }

  export type CourseTagUpdateWithWhereUniqueWithoutCourseInput = {
    where: CourseTagWhereUniqueInput
    data: XOR<CourseTagUpdateWithoutCourseInput, CourseTagUncheckedUpdateWithoutCourseInput>
  }

  export type CourseTagUpdateManyWithWhereWithoutCourseInput = {
    where: CourseTagScalarWhereInput
    data: XOR<CourseTagUpdateManyMutationInput, CourseTagUncheckedUpdateManyWithoutCourseInput>
  }

  export type CourseTagScalarWhereInput = {
    AND?: CourseTagScalarWhereInput | CourseTagScalarWhereInput[]
    OR?: CourseTagScalarWhereInput[]
    NOT?: CourseTagScalarWhereInput | CourseTagScalarWhereInput[]
    id?: StringFilter<"CourseTag"> | string
    name?: StringFilter<"CourseTag"> | string
    createdAt?: DateTimeFilter<"CourseTag"> | Date | string
    updateAt?: DateTimeFilter<"CourseTag"> | Date | string
    courseId?: StringNullableFilter<"CourseTag"> | string | null
  }

  export type CourseModuleUpsertWithWhereUniqueWithoutCourseInput = {
    where: CourseModuleWhereUniqueInput
    update: XOR<CourseModuleUpdateWithoutCourseInput, CourseModuleUncheckedUpdateWithoutCourseInput>
    create: XOR<CourseModuleCreateWithoutCourseInput, CourseModuleUncheckedCreateWithoutCourseInput>
  }

  export type CourseModuleUpdateWithWhereUniqueWithoutCourseInput = {
    where: CourseModuleWhereUniqueInput
    data: XOR<CourseModuleUpdateWithoutCourseInput, CourseModuleUncheckedUpdateWithoutCourseInput>
  }

  export type CourseModuleUpdateManyWithWhereWithoutCourseInput = {
    where: CourseModuleScalarWhereInput
    data: XOR<CourseModuleUpdateManyMutationInput, CourseModuleUncheckedUpdateManyWithoutCourseInput>
  }

  export type CourseModuleScalarWhereInput = {
    AND?: CourseModuleScalarWhereInput | CourseModuleScalarWhereInput[]
    OR?: CourseModuleScalarWhereInput[]
    NOT?: CourseModuleScalarWhereInput | CourseModuleScalarWhereInput[]
    id?: StringFilter<"CourseModule"> | string
    title?: StringFilter<"CourseModule"> | string
    description?: StringFilter<"CourseModule"> | string
    courseId?: StringFilter<"CourseModule"> | string
    order?: IntFilter<"CourseModule"> | number
    createdAt?: DateTimeFilter<"CourseModule"> | Date | string
    updateAt?: DateTimeFilter<"CourseModule"> | Date | string
  }

  export type CourseCreateWithoutModulesInput = {
    id?: string
    status?: $Enums.CourseStatus
    title: string
    slug: string
    description: string
    shortDescription?: string | null
    thumbnail: string
    price: number
    discountPrice?: number | null
    difficulty?: $Enums.CourseDifficulty
    createdAt?: Date | string
    updateAt?: Date | string
    tags?: CourseTagCreateNestedManyWithoutCourseInput
  }

  export type CourseUncheckedCreateWithoutModulesInput = {
    id?: string
    status?: $Enums.CourseStatus
    title: string
    slug: string
    description: string
    shortDescription?: string | null
    thumbnail: string
    price: number
    discountPrice?: number | null
    difficulty?: $Enums.CourseDifficulty
    createdAt?: Date | string
    updateAt?: Date | string
    tags?: CourseTagUncheckedCreateNestedManyWithoutCourseInput
  }

  export type CourseCreateOrConnectWithoutModulesInput = {
    where: CourseWhereUniqueInput
    create: XOR<CourseCreateWithoutModulesInput, CourseUncheckedCreateWithoutModulesInput>
  }

  export type CourseLessonCreateWithoutModuleInput = {
    id?: string
    title: string
    description: string
    videoId: string
    durationInMs: number
    order: number
    createdAt?: Date | string
    updateAt?: Date | string
  }

  export type CourseLessonUncheckedCreateWithoutModuleInput = {
    id?: string
    title: string
    description: string
    videoId: string
    durationInMs: number
    order: number
    createdAt?: Date | string
    updateAt?: Date | string
  }

  export type CourseLessonCreateOrConnectWithoutModuleInput = {
    where: CourseLessonWhereUniqueInput
    create: XOR<CourseLessonCreateWithoutModuleInput, CourseLessonUncheckedCreateWithoutModuleInput>
  }

  export type CourseLessonCreateManyModuleInputEnvelope = {
    data: CourseLessonCreateManyModuleInput | CourseLessonCreateManyModuleInput[]
    skipDuplicates?: boolean
  }

  export type CourseUpsertWithoutModulesInput = {
    update: XOR<CourseUpdateWithoutModulesInput, CourseUncheckedUpdateWithoutModulesInput>
    create: XOR<CourseCreateWithoutModulesInput, CourseUncheckedCreateWithoutModulesInput>
    where?: CourseWhereInput
  }

  export type CourseUpdateToOneWithWhereWithoutModulesInput = {
    where?: CourseWhereInput
    data: XOR<CourseUpdateWithoutModulesInput, CourseUncheckedUpdateWithoutModulesInput>
  }

  export type CourseUpdateWithoutModulesInput = {
    id?: StringFieldUpdateOperationsInput | string
    status?: EnumCourseStatusFieldUpdateOperationsInput | $Enums.CourseStatus
    title?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    shortDescription?: NullableStringFieldUpdateOperationsInput | string | null
    thumbnail?: StringFieldUpdateOperationsInput | string
    price?: FloatFieldUpdateOperationsInput | number
    discountPrice?: NullableFloatFieldUpdateOperationsInput | number | null
    difficulty?: EnumCourseDifficultyFieldUpdateOperationsInput | $Enums.CourseDifficulty
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updateAt?: DateTimeFieldUpdateOperationsInput | Date | string
    tags?: CourseTagUpdateManyWithoutCourseNestedInput
  }

  export type CourseUncheckedUpdateWithoutModulesInput = {
    id?: StringFieldUpdateOperationsInput | string
    status?: EnumCourseStatusFieldUpdateOperationsInput | $Enums.CourseStatus
    title?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    shortDescription?: NullableStringFieldUpdateOperationsInput | string | null
    thumbnail?: StringFieldUpdateOperationsInput | string
    price?: FloatFieldUpdateOperationsInput | number
    discountPrice?: NullableFloatFieldUpdateOperationsInput | number | null
    difficulty?: EnumCourseDifficultyFieldUpdateOperationsInput | $Enums.CourseDifficulty
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updateAt?: DateTimeFieldUpdateOperationsInput | Date | string
    tags?: CourseTagUncheckedUpdateManyWithoutCourseNestedInput
  }

  export type CourseLessonUpsertWithWhereUniqueWithoutModuleInput = {
    where: CourseLessonWhereUniqueInput
    update: XOR<CourseLessonUpdateWithoutModuleInput, CourseLessonUncheckedUpdateWithoutModuleInput>
    create: XOR<CourseLessonCreateWithoutModuleInput, CourseLessonUncheckedCreateWithoutModuleInput>
  }

  export type CourseLessonUpdateWithWhereUniqueWithoutModuleInput = {
    where: CourseLessonWhereUniqueInput
    data: XOR<CourseLessonUpdateWithoutModuleInput, CourseLessonUncheckedUpdateWithoutModuleInput>
  }

  export type CourseLessonUpdateManyWithWhereWithoutModuleInput = {
    where: CourseLessonScalarWhereInput
    data: XOR<CourseLessonUpdateManyMutationInput, CourseLessonUncheckedUpdateManyWithoutModuleInput>
  }

  export type CourseLessonScalarWhereInput = {
    AND?: CourseLessonScalarWhereInput | CourseLessonScalarWhereInput[]
    OR?: CourseLessonScalarWhereInput[]
    NOT?: CourseLessonScalarWhereInput | CourseLessonScalarWhereInput[]
    id?: StringFilter<"CourseLesson"> | string
    title?: StringFilter<"CourseLesson"> | string
    description?: StringFilter<"CourseLesson"> | string
    videoId?: StringFilter<"CourseLesson"> | string
    durationInMs?: IntFilter<"CourseLesson"> | number
    order?: IntFilter<"CourseLesson"> | number
    moduleId?: StringFilter<"CourseLesson"> | string
    createdAt?: DateTimeFilter<"CourseLesson"> | Date | string
    updateAt?: DateTimeFilter<"CourseLesson"> | Date | string
  }

  export type CourseModuleCreateWithoutLessonsInput = {
    id?: string
    title: string
    description: string
    order: number
    createdAt?: Date | string
    updateAt?: Date | string
    course: CourseCreateNestedOneWithoutModulesInput
  }

  export type CourseModuleUncheckedCreateWithoutLessonsInput = {
    id?: string
    title: string
    description: string
    courseId: string
    order: number
    createdAt?: Date | string
    updateAt?: Date | string
  }

  export type CourseModuleCreateOrConnectWithoutLessonsInput = {
    where: CourseModuleWhereUniqueInput
    create: XOR<CourseModuleCreateWithoutLessonsInput, CourseModuleUncheckedCreateWithoutLessonsInput>
  }

  export type CourseModuleUpsertWithoutLessonsInput = {
    update: XOR<CourseModuleUpdateWithoutLessonsInput, CourseModuleUncheckedUpdateWithoutLessonsInput>
    create: XOR<CourseModuleCreateWithoutLessonsInput, CourseModuleUncheckedCreateWithoutLessonsInput>
    where?: CourseModuleWhereInput
  }

  export type CourseModuleUpdateToOneWithWhereWithoutLessonsInput = {
    where?: CourseModuleWhereInput
    data: XOR<CourseModuleUpdateWithoutLessonsInput, CourseModuleUncheckedUpdateWithoutLessonsInput>
  }

  export type CourseModuleUpdateWithoutLessonsInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    order?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updateAt?: DateTimeFieldUpdateOperationsInput | Date | string
    course?: CourseUpdateOneRequiredWithoutModulesNestedInput
  }

  export type CourseModuleUncheckedUpdateWithoutLessonsInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    courseId?: StringFieldUpdateOperationsInput | string
    order?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updateAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CourseTagCreateManyCourseInput = {
    id?: string
    name: string
    createdAt?: Date | string
    updateAt?: Date | string
  }

  export type CourseModuleCreateManyCourseInput = {
    id?: string
    title: string
    description: string
    order: number
    createdAt?: Date | string
    updateAt?: Date | string
  }

  export type CourseTagUpdateWithoutCourseInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updateAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CourseTagUncheckedUpdateWithoutCourseInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updateAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CourseTagUncheckedUpdateManyWithoutCourseInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updateAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CourseModuleUpdateWithoutCourseInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    order?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updateAt?: DateTimeFieldUpdateOperationsInput | Date | string
    lessons?: CourseLessonUpdateManyWithoutModuleNestedInput
  }

  export type CourseModuleUncheckedUpdateWithoutCourseInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    order?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updateAt?: DateTimeFieldUpdateOperationsInput | Date | string
    lessons?: CourseLessonUncheckedUpdateManyWithoutModuleNestedInput
  }

  export type CourseModuleUncheckedUpdateManyWithoutCourseInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    order?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updateAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CourseLessonCreateManyModuleInput = {
    id?: string
    title: string
    description: string
    videoId: string
    durationInMs: number
    order: number
    createdAt?: Date | string
    updateAt?: Date | string
  }

  export type CourseLessonUpdateWithoutModuleInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    videoId?: StringFieldUpdateOperationsInput | string
    durationInMs?: IntFieldUpdateOperationsInput | number
    order?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updateAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CourseLessonUncheckedUpdateWithoutModuleInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    videoId?: StringFieldUpdateOperationsInput | string
    durationInMs?: IntFieldUpdateOperationsInput | number
    order?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updateAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CourseLessonUncheckedUpdateManyWithoutModuleInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    videoId?: StringFieldUpdateOperationsInput | string
    durationInMs?: IntFieldUpdateOperationsInput | number
    order?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updateAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }



  /**
   * Batch Payload for updateMany & deleteMany & createMany
   */

  export type BatchPayload = {
    count: number
  }

  /**
   * DMMF
   */
  export const dmmf: runtime.BaseDMMF
}