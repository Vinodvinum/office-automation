# n8n Workflows Guide

## Setup n8n

### Option 1: Self-Hosted (Docker)
```bash
docker run -d \
  -p 5678:5678 \
  -e DB_TYPE=postgres \
  -e DB_POSTGRE_HOST=localhost \
  -e DB_POSTGRE_PORT=5432 \
  -e DB_POSTGRE_DATABASE=n8n \
  -e DB_POSTGRE_USER=n8n \
  -e DB_POSTGRE_PASSWORD=password \
  n8nio/n8n
```

Visit: http://localhost:5678

### Option 2: n8n Cloud
Go to https://n8n.cloud and create account

## Workflow 1: Task Created → Schedule Reminders

**Flow:**
1. **Webhook Trigger**
   - Method: POST
   - Path: `/webhook/task-created`
   - Auth: None (for MVP; add in production)

2. **Wait Node** (optional - if task not urgent)
   - Wait until: `{{ $json.dueDate }} - 1 day`

3. **IF Node** - Check priority
   - IF `$json.priority === "URGENT"` → send now
   - ELSE → wait until due date - 1 day

4. **Send Email Node**
   - From: noreply@vlookup.com
   - To: `{{ $json.assignedToEmail }}`
   - Subject: `Task Reminder: {{ $json.title }}`
   - Body:
     ```
     Hi,

     This is a reminder that the following task is due:

     📋 Task: {{ $json.title }}
     📌 Client: {{ $json.clientName }}
     📅 Due: {{ $json.dueDate }}
     🎯 Priority: {{ $json.priority }}

     Please complete this task as soon as possible.

     —
     Vlookup Automation
     ```

5. **Alternative: Telegram Node**
   - Chat ID: from Telegram bot
   - Message: `🔔 Task Reminder\n{{ $json.title }}\nDue: {{ $json.dueDate }}`

**n8n JSON (import this):**
```json
{
  "nodes": [
    {
      "parameters": {
        "path": "task-created",
        "responseMode": "onReceived"
      },
      "name": "Webhook",
      "type": "n8n-nodes-base.webhook",
      "typeVersion": 1,
      "position": [100, 300]
    },
    {
      "parameters": {
        "conditions": {
          "boolean": [
            {
              "value1": "{{ $json.priority }}",
              "condition": "equal",
              "value2": "URGENT"
            }
          ]
        }
      },
      "name": "Is Urgent?",
      "type": "n8n-nodes-base.if",
      "typeVersion": 1,
      "position": [300, 250]
    },
    {
      "parameters": {
        "unit": "days",
        "amount": 1
      },
      "name": "Wait 1 Day Before",
      "type": "n8n-nodes-base.wait",
      "typeVersion": 1,
      "position": [500, 350]
    },
    {
      "parameters": {
        "toEmail": "{{ $json.assignedToEmail }}",
        "subject": "Task Reminder: {{ $json.title }}",
        "textOnly": false,
        "htmlEmail": "<h2>Task Reminder</h2><p><strong>{{ $json.title }}</strong></p><p>Due: {{ $json.dueDate }}</p>"
      },
      "name": "Send Email",
      "type": "n8n-nodes-base.emailSend",
      "typeVersion": 1,
      "position": [700, 300]
    }
  ],
  "connections": {
    "Webhook": {
      "main": [[{"node": "Is Urgent?", "type": "main", "index": 0}]]
    },
    "Is Urgent?": {
      "main": [
        [{"node": "Send Email", "type": "main", "index": 0}],
        [{"node": "Wait 1 Day Before", "type": "main", "index": 0}]
      ]
    },
    "Wait 1 Day Before": {
      "main": [[{"node": "Send Email", "type": "main", "index": 0}]]
    }
  }
}
```

## Workflow 2: Task Completed → Log to Google Sheet

**Prerequisites:**
- Google Account
- Google Sheet created (share with n8n service account)

**Flow:**
1. **Webhook Trigger**
   - Method: POST
   - Path: `/webhook/task-completed`

2. **Timestamp Node** (optional)
   - Adds current timestamp

3. **Google Sheets Node**
   - Action: Append row
   - Range: `A:E` (or create named range)
   - Values:
     - Column A: `{{ $json.completedAt }}`
     - Column B: `{{ $json.title }}`
     - Column C: `{{ $json.clientName }}`
     - Column D: `{{ $json.assignedToName }}`
     - Column E: "✓ Done"

4. **Respond to Webhook Node**
   - Status: 200
   - Body: `{ "success": true }`

**Google Sheet Template:**
```
Date        | Task Title           | Client          | Agent      | Status
2026-05-28  | Send rent reminder   | UK Property A   | John       | ✓ Done
2026-05-28  | Fix door lock        | London Rentals  | Sarah      | ✓ Done
```

## Workflow 3: Daily 7 PM Summary → Manager Email

**Prerequisites:**
- Manager email address
- Optional: Slack/Telegram webhook

**Flow:**
1. **Cron Trigger**
   - Cron expression: `0 19 * * *` (7 PM UTC; adjust for IST: `30 13 * * *`)

2. **HTTP Request Node (GET)**
   - URL: `https://your-app.vercel.app/api/reports/summary?date={{ $now.format("YYYY-MM-DD") }}`
   - Headers: (optional API key if needed)
   - Response: JSON

3. **Format Message Node** (optional)
   - Build HTML email with metrics

4. **Send Email Node**
   - To: manager@company.com
   - Subject: `Daily Ops Summary – {{ $now.format("MMMM DD, YYYY") }}`
   - Body (HTML):
     ```html
     <h1>📊 Daily Operations Summary</h1>
     <p><strong>Date:</strong> {{ $json[0].date }}</p>

     <h2>Key Metrics</h2>
     <ul>
       <li>🔵 Open Tasks: <strong>{{ $json[0].openTasks }}</strong></li>
       <li>🔴 Overdue: <strong>{{ $json[0].overdueTasks }}</strong></li>
       <li>🟢 Completed Today: <strong>{{ $json[0].completedToday }}</strong></li>
     </ul>

     <h2>By Client</h2>
     <table border="1">
       <tr>
         <th>Client</th>
         <th>Open</th>
         <th>Overdue</th>
         <th>Done</th>
       </tr>
       {{ $json[0].tasksByClient.map(client => `
         <tr>
           <td>${client.clientName}</td>
           <td>${client.open}</td>
           <td>${client.overdue}</td>
           <td>${client.completed}</td>
         </tr>
       `).join('') }}
     </table>

     <p><em>Auto-generated by Vlookup Automation</em></p>
     ```

5. **Alternative: Slack Node**
   - Channel: #ops-daily
   - Message:
     ```
     📊 Daily Summary – {{ $now.format("MMMM DD") }}
     Open: {{ $json[0].openTasks }} | Overdue: {{ $json[0].overdueTasks }} | Done: {{ $json[0].completedToday }}
     ```

## Testing Workflows Locally

### Test Webhook Trigger
```bash
curl -X POST http://localhost:5678/webhook/task-created \
  -H "Content-Type: application/json" \
  -d '{
    "taskId": "test-123",
    "title": "Send rent reminder",
    "dueDate": "2026-05-30T10:00:00Z",
    "assignedToEmail": "agent@example.com",
    "clientName": "Test Client",
    "priority": "HIGH"
  }'
```

### Monitor Workflow Execution
1. Open n8n dashboard
2. Click workflow → "Executions"
3. View logs and debug any errors

## Production Checklist

- [ ] Set API key validation on webhooks
- [ ] Configure error handling (retry logic)
- [ ] Add logging for audit trail
- [ ] Test email delivery (check spam)
- [ ] Set up Slack notifications for workflow failures
- [ ] Configure rate limits
- [ ] Enable workflow backups
- [ ] Document custom variables
- [ ] Train team on workflow updates

## Troubleshooting

### Webhook not triggering
1. Check webhook URL matches exactly
2. Verify HTTP method is POST
3. Check n8n execution logs for errors
4. Test with curl command above

### Email not sending
1. Verify email credentials in n8n
2. Check email content for spam filters
3. Enable "Less secure apps" if using Gmail
4. Review email logs in n8n

### Google Sheets not updating
1. Verify sheet is shared with n8n service account
2. Check range format (should be `Sheet1!A:E`)
3. Ensure columns have proper headers
4. Review Google Sheets API logs

### Cron not running
1. Verify cron expression: https://crontab.guru
2. Check n8n timezone settings
3. Ensure n8n service is running continuously
4. Review system logs for errors
