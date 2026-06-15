import {Request, Response } from "express";
import db from "../db/db";
import {z} from "zod";
import logger from "../lib/logger";
import {PoolClient} from "pg";

