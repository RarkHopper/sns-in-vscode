#!/usr/bin/env node
import path from 'node:path';
import { Database } from '@sns-in-vscode/db';
import { SqlitePostRepository } from '@sns-in-vscode/domain';
import { render } from 'ink';
import React from 'react';
import { App } from './App.js';

const dbPath = process.env['SNS_DB_PATH'] ?? path.join(process.env['HOME'] ?? '.', '.sns.db');
const db = Database.open(dbPath);
const repository = new SqlitePostRepository(db);

const { waitUntilExit } = render(React.createElement(App, { repository }));

await waitUntilExit();
db.close();
