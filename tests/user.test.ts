import { describe, it, expect } from "vitest";
import axios from "axios";
import cypto from "crypto";

describe("userRouter", () => {
  it("should create a user and return 201", async () => {
    const res = await axios.post("http://localhost:8080/webhook/user/registered", 
      {
        data: {
            email_addresses: [
                {
                    email_address: `example@example.org`
                }
            ],
            username: "example123",
            first_name: "FirstName",
            last_name: "LastName",
            id: cypto.randomUUID() // Simulating Clerk user ID
        }
        }
    );
    expect(res.status).toBe(200);
    expect(res.data.message).toBe("User registration received");
  });
});

describe("userSubscriptionRouter", () => {
  it("should update user subscription and return 200", async () => {
    const res = await axios.post("http://localhost:8080/webhook/user/payments/web3", 
      {
        data: {
            transactionId: cypto.randomUUID(), // Simulating transaction ID
            userId: cypto.randomUUID(), // Simulating Clerk user ID
            subscriptionPlan: "basic" // Example subscription plan
        }
      }
    );
    expect(res.status).toBe(200);
    expect(res.data.message).toBe("User subscription update received");
  });
});