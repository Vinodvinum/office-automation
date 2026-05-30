import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  console.log("🌱 Seeding database...")

  // Clear existing data
  await prisma.taskEvent.deleteMany()
  await prisma.task.deleteMany()
  await prisma.user.deleteMany()
  await prisma.client.deleteMany()

  // Create clients
  const client1 = await prisma.client.create({
    data: {
      name: "UK Property Management",
    },
  })

  const client2 = await prisma.client.create({
    data: {
      name: "London Rentals",
    },
  })

  const client3 = await prisma.client.create({
    data: {
      name: "Birmingham Properties",
    },
  })

  console.log("✅ Created 3 clients")

  // Create users
  const user1 = await prisma.user.create({
    data: {
      name: "John Smith",
      email: "john.smith@company.com",
      role: "AGENT",
    },
  })

  const user2 = await prisma.user.create({
    data: {
      name: "Sarah Manager",
      email: "sarah.manager@company.com",
      role: "MANAGER",
    },
  })

  const user3 = await prisma.user.create({
    data: {
      name: "Mike Johnson",
      email: "mike.johnson@company.com",
      role: "AGENT",
    },
  })

  console.log("✅ Created 3 users")

  // Create sample tasks
  const today = new Date()
  const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000)
  const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
  const nextMonth = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000)

  // Task 1: Open URGENT task (overdue)
  const task1 = await prisma.task.create({
    data: {
      title: "Send rent reminder – Flat 301",
      description: "Send reminder email to tenant for May rent payment",
      type: "RENT",
      status: "OPEN",
      priority: "URGENT",
      dueDate: new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      clientId: client1.id,
      assignedToId: user1.id,
    },
  })

  const task1Event = await prisma.taskEvent.create({
    data: {
      taskId: task1.id,
      eventType: "CREATED",
      userId: user2.id,
      metadata: {
        title: task1.title,
        priority: task1.priority,
      },
    },
  })

  // Task 2: In Progress
  const task2 = await prisma.task.create({
    data: {
      title: "Fix door lock – Flat 205",
      description: "Tenant reported broken door lock",
      type: "MAINTENANCE",
      status: "IN_PROGRESS",
      priority: "HIGH",
      dueDate: tomorrow,
      clientId: client1.id,
      assignedToId: user1.id,
    },
  })

  // Task 3: Open with medium priority
  const task3 = await prisma.task.create({
    data: {
      title: "Follow up on tenant complaint – Flat 102",
      description: "Tenant complained about water pressure",
      type: "FOLLOWUP",
      status: "OPEN",
      priority: "MEDIUM",
      dueDate: nextWeek,
      clientId: client2.id,
      assignedToId: user3.id,
    },
  })

  // Task 4: Completed
  const task4 = await prisma.task.create({
    data: {
      title: "Arrange viewing – Property 15",
      description: "Scheduled viewing with prospective tenant",
      type: "OTHER",
      status: "COMPLETED",
      priority: "HIGH",
      dueDate: today,
      clientId: client2.id,
      assignedToId: user3.id,
    },
  })

  await prisma.taskEvent.create({
    data: {
      taskId: task4.id,
      eventType: "CREATED",
      userId: user2.id,
      metadata: { title: task4.title },
    },
  })

  await prisma.taskEvent.create({
    data: {
      taskId: task4.id,
      eventType: "STATUS_CHANGED",
      userId: user3.id,
      metadata: {
        previousStatus: "OPEN",
        newStatus: "COMPLETED",
      },
    },
  })

  // Task 5: Overdue task
  const task5 = await prisma.task.create({
    data: {
      title: "Update building insurance",
      description: "Renew annual building insurance policy",
      type: "OTHER",
      status: "OPEN",
      priority: "HIGH",
      dueDate: new Date(today.getTime() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
      clientId: client3.id,
      assignedToId: user1.id,
    },
  })

  // Task 6: Future task
  const task6 = await prisma.task.create({
    data: {
      title: "Schedule Q2 property inspection",
      description: "Annual inspection due next quarter",
      type: "MAINTENANCE",
      status: "OPEN",
      priority: "LOW",
      dueDate: nextMonth,
      clientId: client1.id,
      assignedToId: user2.id,
    },
  })

  // Task 7: Another open task
  const task7 = await prisma.task.create({
    data: {
      title: "Review tenant application – Flat 401",
      description: "New tenant application received",
      type: "FOLLOWUP",
      status: "OPEN",
      priority: "MEDIUM",
      dueDate: new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
      clientId: client3.id,
      assignedToId: user3.id,
    },
  })

  // Task 8: Client 2 task
  const task8 = await prisma.task.create({
    data: {
      title: "Process security deposit refund",
      description: "Tenant moving out – process £1200 deposit refund",
      type: "FOLLOWUP",
      status: "OPEN",
      priority: "HIGH",
      dueDate: tomorrow,
      clientId: client2.id,
      assignedToId: user1.id,
    },
  })

  console.log("✅ Created 8 sample tasks")

  console.log("\n📊 Seed Summary:")
  console.log(`   • ${3} clients`)
  console.log(`   • ${3} users`)
  console.log(`   • ${8} tasks`)
  console.log("\n🌐 Access dashboard at: http://localhost:3000")
  console.log("📋 View all tasks at: http://localhost:3000/tasks\n")
}

main()
  .then(async () => {
    await prisma.$disconnect()
    console.log("✨ Seeding complete!")
  })
  .catch(async (e) => {
    console.error("❌ Seeding failed:", e)
    await prisma.$disconnect()
    process.exit(1)
  })
