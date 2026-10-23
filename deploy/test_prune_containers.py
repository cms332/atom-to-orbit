"""Deletion-boundary tests; no Docker daemon is used."""
from copy import deepcopy
import importlib.util
from pathlib import Path
import unittest


spec = importlib.util.spec_from_file_location('prune', Path(__file__).with_name('prune-containers.py'))
prune = importlib.util.module_from_spec(spec)
spec.loader.exec_module(prune)


def container(service, release, running=True):
    name = service + '-' + release
    image = 'a2o-web' if service == 'a2o' else service
    return {'Id': name.ljust(64, '0'), 'Name': '/' + name,
            'Config': {'Image': image + ':' + release}, 'Mounts': [],
            'State': {'Running': running, 'Health': {'Status': 'healthy'}},
            'NetworkSettings': {'Networks': {'web': {'IPAddress': '172.20.0.10' if release.endswith('02Z') else '172.20.0.11'}}}}


class CleanupBoundaryTests(unittest.TestCase):
    def setUp(self):
        self.keep = container('a2o', '20261023T000002Z')
        self.old = container('a2o', '20261023T000001Z')
        self.name = self.keep['Name'][1:]
        self.proxy = {'routes': [{'domains': ['a2o.kr', 'www.a2o.kr'], 'target': self.name,
                                  'enabled': True, 'online': True}]}

    def plan(self, inventory=None, proxy=None, name=None):
        return prune.deletion_plan('a2o', name or self.name,
                                   inventory or [self.keep, self.old], proxy or self.proxy)

    def test_only_exact_dated_namespace_is_selected(self):
        other = deepcopy(self.old)
        other['Name'] = '/analytics-postgres'
        another = deepcopy(self.old)
        another['Name'] += '-unmanaged'
        self.assertEqual(self.plan([self.keep, self.old, other, another]), [self.old])

    def test_stopped_old_container_is_also_removed(self):
        self.old['State']['Running'] = False
        self.assertEqual(self.plan(), [self.old])

    def test_missing_unhealthy_or_mismatched_keep_aborts(self):
        with self.assertRaises(ValueError):
            self.plan([self.old])
        self.keep['State']['Health']['Status'] = 'unhealthy'
        with self.assertRaises(ValueError):
            self.plan()
        self.keep['State']['Health']['Status'] = 'healthy'
        self.keep['Config']['Image'] = 'unrelated:latest'
        with self.assertRaises(ValueError):
            self.plan()

    def test_routing_must_match_state_and_be_online(self):
        self.proxy['routes'][0]['target'] = self.old['Name'][1:]
        with self.assertRaises(ValueError):
            self.plan()
        self.proxy['routes'][0]['target'] = self.name
        self.proxy['routes'][0]['online'] = False
        with self.assertRaises(ValueError):
            self.plan()

    def test_mounts_or_unexpected_old_image_aborts(self):
        self.old['Mounts'] = [{'Type': 'volume', 'Name': 'important'}]
        with self.assertRaises(ValueError):
            self.plan()
        self.old['Mounts'] = []
        self.old['Config']['Image'] = 'postgres:17'
        with self.assertRaises(ValueError):
            self.plan()

    def test_other_proxy_reference_by_name_id_or_ip_aborts(self):
        for reference in (self.old['Name'][1:], self.old['Id'], self.old['Id'][:12], '172.20.0.11'):
            with self.subTest(reference=reference):
                proxy = deepcopy(self.proxy)
                proxy['routes'].append({'domains': ['other.example'], 'target': reference, 'enabled': True})
                with self.assertRaises(ValueError):
                    self.plan(proxy=proxy)

    def test_shared_or_duplicate_domain_route_aborts(self):
        self.proxy['routes'][0]['domains'].append('other.example')
        with self.assertRaises(ValueError):
            self.plan()
        self.proxy['routes'][0]['domains'].pop()
        self.proxy['routes'].append(deepcopy(self.proxy['routes'][0]))
        with self.assertRaises(ValueError):
            self.plan()

    def test_hgi_is_independently_scoped(self):
        keep = container('hgi-preview', '20261023T000002Z')
        old = container('hgi-preview', '20261023T000001Z')
        proxy = {'routes': [{'domains': ['preview.hgi.kr'], 'target': keep['Name'][1:],
                             'enabled': True, 'online': True}]}
        self.assertEqual(prune.deletion_plan('hgi-preview', keep['Name'][1:],
                                            [self.keep, self.old, keep, old], proxy), [old])

    def test_already_single_container_is_noop_and_invalid_keep_is_rejected(self):
        self.assertEqual(self.plan([self.keep]), [])
        with self.assertRaises(ValueError):
            self.plan(name='analytics-postgres')


if __name__ == '__main__':
    unittest.main()
