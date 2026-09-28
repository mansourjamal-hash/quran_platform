import { createHash, randomBytes, scrypt as nodeScrypt, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';
import { and, eq, gt } from 'drizzle-orm';
import { db, sessionsTable, usersTable } from '@workspace/db';
import type { Request, Response } from 'express';

const scrypt=promisify(nodeScrypt);
const COOKIE='quran_session';
const DAYS=14;

export async function hashPassword(password:string){const salt=randomBytes(16).toString('hex');const key=(await scrypt(password,salt,64)) as Buffer;return `${salt}:${key.toString('hex')}`;}
export async function verifyPassword(password:string,stored:string){const [salt,hex]=stored.split(':');if(!salt||!hex)return false;const key=(await scrypt(password,salt,64)) as Buffer;const expected=Buffer.from(hex,'hex');return expected.length===key.length&&timingSafeEqual(expected,key);}
function hashToken(token:string){return createHash('sha256').update(token).digest('hex');}
export async function createSession(userId:string,res:Response){const token=randomBytes(32).toString('hex');const tokenHash=hashToken(token);const expiresAt=new Date(Date.now()+DAYS*86400000);await db.insert(sessionsTable).values({tokenHash,userId,expiresAt});res.cookie(COOKIE,token,{httpOnly:true,sameSite:'lax',secure:process.env.NODE_ENV==='production',expires:expiresAt});}
export async function clearSession(req:Request,res:Response){const token=req.cookies?.[COOKIE];if(token)await db.delete(sessionsTable).where(eq(sessionsTable.tokenHash,hashToken(token)));res.clearCookie(COOKIE);}
export async function currentUser(req:Request){const token=req.cookies?.[COOKIE];if(!token)return null;const rows=await db.select({user:usersTable}).from(sessionsTable).innerJoin(usersTable,eq(sessionsTable.userId,usersTable.id)).where(and(eq(sessionsTable.tokenHash,hashToken(token)),gt(sessionsTable.expiresAt,new Date()))).limit(1);return rows[0]?.user??null;}
