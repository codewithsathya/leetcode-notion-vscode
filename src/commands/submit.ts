// Copyright (c) codewithsathya. All rights reserved.
// Licensed under the MIT license.

import * as vscode from "vscode";
import { leetCodeTreeDataProvider } from "../explorer/LeetCodeTreeDataProvider";
import { leetCodeExecutor } from "../leetCodeExecutor";
import { leetCodeManager } from "../leetCodeManager";
import { DialogType, promptForOpenOutputChannel, promptForSignIn } from "../utils/uiUtils";
import { getActiveFilePath } from "../utils/workspaceUtils";
import { leetCodeSubmissionProvider } from "../webview/leetCodeSubmissionProvider";
import {readFileSync} from "fs";
import { ExtensionContext } from 'vscode';
import { updateNotionTasks } from './notion'

export async function submitSolution(context: ExtensionContext, uri?: vscode.Uri): Promise<void> {
    if (!leetCodeManager.getUser()) {
        promptForSignIn();
        return;
    }

    const filePath: string | undefined = await getActiveFilePath(uri);
    if (!filePath) {
        return;
    }

    try {
        const result: string = await leetCodeExecutor.submitSolution(filePath);
        leetCodeSubmissionProvider.show(result);
        if(result.indexOf("Accepted") > -1){
            const code = readFileSync(filePath, 'utf-8');
            const secret = context.globalState.get("notionSecret");
            const leetnotionEmail = context.globalState.get("leetnotionEmail");
            
            updateNotionTasks(leetnotionEmail, secret, code);
        }
    } catch (error) {
        await promptForOpenOutputChannel("Failed to submit the solution. Please open the output channel for details.", DialogType.error);
        return;
    }

    leetCodeTreeDataProvider.refresh();
}
