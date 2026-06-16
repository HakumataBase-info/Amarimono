import { memberRepository } from "@/repository/member.repository";
import { MemberWithRelations, MemberSummary } from "@/types";

export class MemberService {
  async getMembers(): Promise<MemberSummary[]> {
    return memberRepository.findAll();
  }

  async getMemberBySlug(slug: string): Promise<MemberWithRelations | null> {
    return memberRepository.findBySlug(slug);
  }

  async getAdjacentMembers(slug: string): Promise<{ prev: MemberSummary | null; next: MemberSummary | null }> {
    return memberRepository.findAdjacent(slug);
  }
}
export const memberService = new MemberService();
export const getMembers = () => memberService.getMembers();
export const getMemberBySlug = (slug: string) => memberService.getMemberBySlug(slug);
export const getAdjacentMembers = (slug: string) => memberService.getAdjacentMembers(slug);
