use anchor_lang::prelude::*;

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

#[program]
pub mod anchor_hello_friends {
    use anchor_lang::solana_program::{entrypoint::ProgramResult, message};

    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> ProgramResult {
        let hf_account = &mut ctx.accounts.hf_account;

        hf_account.message_count = 0;
        Ok(())
    }
    pub fn say_hello(ctx: Context<SayHello>, message: String) -> ProgramResult {
        let hf_account = &mut ctx.accounts.hf_account;

        let message = message.clone();
        let timestamp = Clock::get().unwrap().unix_timestamp;

        let user = *ctx.accounts.user.to_account_info().key;

        let hf_message = HfMessage {
            user,
            message,
            timestamp,
        };
        hf_account.message_list.push(hf_message);
        hf_account.message_count += 1;

        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(init , payer = user , space = 64 + 1024)]
    pub hf_account: Account<'info, HfAccount>,

    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct SayHello<'info> {
    #[account(mut)]
    pub hf_account: Account<'info, HfAccount>,
    pub user: Signer<'info>,
}

#[account]
pub struct HfAccount {
    pub message_count: u64,
    pub message_list: Vec<HfMessage>,
}

#[derive(Clone, Debug, AnchorSerialize, AnchorDeserialize)]
pub struct HfMessage {
    pub message: String,
    pub user: Pubkey,
    pub timestamp: i64,
}
