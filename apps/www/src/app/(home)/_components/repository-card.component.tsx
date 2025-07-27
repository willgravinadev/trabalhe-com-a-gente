import { type GithubRepository } from '@http/github-repositories/search-github-repositories'
import { CircleDot } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { PiGitFork, PiStar } from 'react-icons/pi'

export function RepositoryCard(props: Readonly<{ repository: GithubRepository }>) {
  return (
    <Link
      href={props.repository.externalURL}
      target='_blank'
      rel='noopener noreferrer'
      key={props.repository.externalID}
      className='border-border hover:border-accent hover:bg-card group flex flex-col items-start justify-between gap-2 rounded-md border px-4 py-2 transition-colors'
    >
      <div className='flex w-full flex-col gap-2'>
        <div className='flex w-full flex-row items-start justify-between gap-2'>
          <div className='flex w-full flex-row items-center gap-2'>
            <Image
              src={props.repository.owner.externalAvatarURL}
              alt={`${props.repository.owner.username} avatar`}
              className='size-6 rounded-md'
              width={32}
              height={32}
            />
            <span className='text-primary group-hover:text-accent text-base font-semibold transition-colors'>{props.repository.fullName}</span>
          </div>
          {props.repository.language && (
            <span className='text-muted-foreground border-border group-hover:border-accent group-hover:bg-accent group-hover:text-accent-foreground rounded-md border px-1 py-0.5 text-right text-xs'>
              {props.repository.language}
            </span>
          )}
        </div>
        <p className='text-muted-foreground min-h-15 text-ellipsis text-sm'>{props.repository.description}</p>
      </div>
      <div className='flex flex-col items-start justify-between gap-2'>
        <div className='flex items-center gap-2 text-sm'>
          <div className='flex flex-row items-center justify-center gap-1'>
            <PiStar className='size-4 text-yellow-400' />
            <span className='text-muted-foreground'>{props.repository.starsCount.toLocaleString()}</span>
          </div>
          <div className='flex flex-row items-center justify-center gap-1'>
            <PiGitFork className='text-muted-foreground size-4' />
            <span className='text-muted-foreground'>{props.repository.forksCount.toLocaleString()}</span>
          </div>
          <div className='flex flex-row items-center justify-center gap-1'>
            <CircleDot className='text-muted-foreground size-4' />
            <span className='text-muted-foreground'>{props.repository.openIssuesCount.toLocaleString()}</span>
          </div>
        </div>
        <span className='text-muted-foreground text-sm'>Criado em {props.repository.createdAt.toLocaleDateString('pt-BR')}</span>
      </div>
    </Link>
  )
}
